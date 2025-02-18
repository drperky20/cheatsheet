
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting implementation
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
  // For images, convert to base64
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
  
  // For text-based files, extract the text content
  const text = await file.text();
  return { text };
}

async function processWithRetry(genAI: any, messages: any[], maxRetries = 3): Promise<string> {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use flash model for faster responses
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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const question = formData.get('question') as string | null;

    if (!file) {
      throw new Error('No file provided');
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('API key configuration error');
    }

    console.log(`Processing file: ${file.name} (${file.type})`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const filePart = await fileToGenerativePart(file);

    const systemPrompt = {
      role: "system",
      content: "You are a helpful AI assistant that analyzes files and helps with both general questions and academic assignments. Provide detailed, accurate analysis while maintaining a friendly and helpful tone."
    };

    const messages = [
      systemPrompt,
      {
        role: "user",
        parts: [
          question ? { text: question } : { text: "Please analyze this file and provide insights:" },
          filePart
        ]
      }
    ];

    const result = await processWithRetry(genAI, messages);
    
    console.log('Successfully analyzed file');
    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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
