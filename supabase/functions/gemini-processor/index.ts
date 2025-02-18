
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute
const requestLog = new Map<string, number[]>();

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientRequests = requestLog.get(clientIP) || [];
  
  // Clean up old requests
  const recentRequests = clientRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  // Update request log
  requestLog.set(clientIP, recentRequests);
  
  return recentRequests.length >= MAX_REQUESTS;
}

function logRequest(clientIP: string) {
  const requests = requestLog.get(clientIP) || [];
  requests.push(Date.now());
  requestLog.set(clientIP, requests);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
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
            'Retry-After': `${RATE_LIMIT_WINDOW / 1000}`
          }
        }
      );
    }

    // Log this request
    logRequest(clientIP);

    // Validate request method
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    // Parse request body
    const requestData = await req.json().catch(error => {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid JSON payload');
    });

    const { content, type } = requestData;

    // Validate required fields
    if (!content || !type) {
      throw new Error('Missing required fields: content and type');
    }

    // Get API key
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('API key configuration error');
    }

    console.log(`Processing ${type} request...`);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Updated system prompt and content processing
    const systemPrompt = `You are a helpful AI assistant that can help with both general questions and academic assignments. 
When users ask about assignments or academic work, you should provide detailed academic analysis and help.
For general questions, respond in a friendly and helpful way without assuming it's assignment-related.
If you detect assignment-related keywords (like "essay", "homework", "assignment", "paper", "report", "thesis", "dissertation", "exam", "quiz", "test", "grade", "rubric", "deadline", "due date"), then activate your academic assistant mode.
Otherwise, respond as a general helpful assistant.`;

    // Combine system prompt with user content
    let prompt = "";
    switch (type) {
      case "analyze_requirements":
        prompt = `${systemPrompt}\n\nAnalyze the following assignment requirements and extract key information like word count, formatting style, and deadline: ${content}`;
        break;
      case "generate_content":
        prompt = `${systemPrompt}\n\n${content}`;
        break;
      default:
        throw new Error(`Invalid processing type: ${type}`);
    }

    // Generate content with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        console.log(`Attempt ${attempts + 1} of ${maxAttempts}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Successfully generated content');
        return new Response(
          JSON.stringify({ result: text }),
          { headers: corsHeaders }
        );
      } catch (error) {
        lastError = error;
        attempts++;
        
        // If it's a rate limit error, wait before retrying
        if (error.toString().includes('429')) {
          console.log('Rate limit hit, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Exponential backoff
          continue;
        }
        
        // For other errors, throw immediately
        throw error;
      }
    }

    // If we get here, all attempts failed
    throw lastError || new Error('Failed to generate content after multiple attempts');

  } catch (error) {
    console.error('Edge Function Error:', error);
    
    // Determine if it's a rate limit error
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
          ...(isRateLimit ? { 'Retry-After': '5' } : {})
        }
      }
    );
  }
});
