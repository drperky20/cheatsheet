import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS = 10;
const requestLog = new Map<string, number[]>();

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientRequests = requestLog.get(clientIP) || [];
  const recentRequests = clientRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  requestLog.set(clientIP, recentRequests);
  return recentRequests.length >= MAX_REQUESTS;
}

function logRequest(clientIP: string) {
  const requests = requestLog.get(clientIP) || [];
  requests.push(Date.now());
  requestLog.set(clientIP, requests);
}

async function fileToGenerativePart(file: File) {
  if (file.type.startsWith('image/')) {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return {
      inlineData: {
        data: base64,
        mimeType: file.type
      }
    };
  }
  
  const text = await file.text();
  return { text };
}

async function processWithRetry(genAI: any, messages: any[], maxRetries = 3): Promise<string> {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(messages);
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (error.toString().includes('429')) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new Error('Failed to process after multiple attempts');
}

const generatePrompt = (config: {
  targetGrade: string;
  selectedFlaws: any[];
  writingStyle: string;
  confidenceLevel: number;
}, assignment: any) => {
  const flawInstructions = config.selectedFlaws.map(flaw => {
    switch (flaw.id) {
      case 'spelling':
        return 'Introduce occasional spelling mistakes (2-3 per paragraph)';
      case 'grammar':
        return 'Include minor grammatical errors in sentence structure';
      case 'misread':
        return 'Slightly misinterpret one minor aspect of the assignment';
      case 'structure':
        return 'Make paragraph transitions less smooth';
      case 'citation':
        return 'Include minor citation formatting inconsistencies';
      case 'informal':
        return 'Use more casual language and contractions';
      case 'repetitive':
        return 'Repeat certain phrases or ideas occasionally';
      case 'shallow':
        return 'Keep analysis at a surface level';
      default:
        return '';
    }
  }).filter(Boolean).join('\n');

  const gradeInstructions = {
    'A': 'Demonstrate strong understanding but include 1-2 minor flaws for authenticity',
    'B': 'Show good comprehension with occasional gaps and simple language',
    'C': 'Present basic understanding with notable oversights and simplified explanations'
  }[config.targetGrade] || 'Show good comprehension with occasional gaps';

  const styleInstructions = {
    'formal': 'Maintain academic language while incorporating specified flaws',
    'casual': 'Use conversational tone and everyday language',
    'mixed': 'Blend academic and casual language naturally'
  }[config.writingStyle] || 'Blend academic and casual language naturally';

  const confidenceAdjustment = config.confidenceLevel < 50 
    ? 'Express ideas with some uncertainty and hedging language'
    : config.confidenceLevel < 75
    ? 'Balance confident statements with occasional uncertainty'
    : 'Maintain mostly confident tone while avoiding overconfidence';

  return `
[ASSIGNMENT ANALYSIS CONFIGURATION]
Target Quality Level: ${config.targetGrade}-grade work
Writing Style: ${styleInstructions}
Confidence Level: ${confidenceAdjustment}

[SPECIFIC INSTRUCTIONS]
${flawInstructions}

[QUALITY GUIDELINES]
${gradeInstructions}

[ASSIGNMENT DETAILS]
${assignment}

Generate a response that follows these specific configurations while maintaining believability as student work. The response should:
1. Match the specified grade level expectations
2. Incorporate requested writing flaws naturally
3. Maintain the specified writing style
4. Reflect the configured confidence level
5. Address the assignment requirements while adhering to these parameters`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again in a minute.',
          retryAfter: RATE_LIMIT_WINDOW / 1000
        }),
        { 
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': `${RATE_LIMIT_WINDOW / 1000}`
          }
        }
      );
    }

    logRequest(clientIP);

    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    const contentType = req.headers.get('content-type') || '';
    let data;
    let file: File | null = null;
    let question = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      file = formData.get('file') as File;
      question = formData.get('question') as string;
      const configStr = formData.get('config') as string;
      const config = configStr ? JSON.parse(configStr) : {
        targetGrade: 'B',
        selectedFlaws: [],
        writingStyle: 'mixed',
        confidenceLevel: 75
      };

      if (!file) {
        throw new Error('No file provided in form data');
      }

      console.log(`Processing file with config:`, config);
      const filePart = await fileToGenerativePart(file);
      const prompt = generatePrompt(config, question || "Please analyze this file and provide insights:");
      
      const messages = [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          parts: [filePart]
        }
      ];

      const result = await processWithRetry(genAI, messages);
      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      data = await req.json();
      if (!data.content || !data.type) {
        throw new Error('Invalid JSON payload: missing content or type');
      }
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('API key configuration error');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    if (file) {
      console.log(`Processing file: ${file.name} (${file.type})`);
      const filePart = await fileToGenerativePart(file);
      const messages = [
        {
          role: "system",
          content: "You are a helpful AI assistant that analyzes files and helps with academic tasks."
        },
        {
          role: "user",
          parts: [
            question ? { text: question } : { text: "Please analyze this file and provide insights:" },
            filePart
          ]
        }
      ];
      const result = await processWithRetry(genAI, messages);
      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const result = await processWithRetry(genAI, [{ text: data.content }]);
      return new Response(
        JSON.stringify({ result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Edge Function Error:', error);
    
    const isRateLimit = error.toString().includes('429');
    
    return new Response(
      JSON.stringify({
        error: isRateLimit 
          ? 'The AI service is currently busy. Please try again in a few moments.'
          : error.message || 'An unexpected error occurred',
        details: error.toString(),
        retryAfter: isRateLimit ? 5 : undefined
      }),
      { 
        status: isRateLimit ? 429 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          ...(isRateLimit ? { 'Retry-After': '5' } : {})
        }
      }
    );
  }
});
