
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
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

    // Prepare prompt
    let prompt = "";
    switch (type) {
      case "analyze_requirements":
        prompt = `Analyze the following assignment requirements and extract key information like word count, formatting style, and deadline: ${content}`;
        break;
      case "generate_content":
        prompt = `Create a high-quality academic response for the following assignment: ${content}`;
        break;
      case "improve_writing":
        prompt = `Improve the following academic writing while maintaining academic integrity: ${content}`;
        break;
      default:
        throw new Error(`Invalid processing type: ${type}`);
    }

    // Generate content
    console.log('Generating content with Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Successfully generated content');

    return new Response(
      JSON.stringify({ result: text }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
