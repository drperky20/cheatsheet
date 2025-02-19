
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  url: string;
  type: 'google_doc' | 'external_link';
}

const GEMINI_MODEL = 'gemini-pro';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type } = await req.json() as RequestBody;
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    console.log(`Processing ${type} URL: ${url}`);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Fetch the content with custom headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      let errorMessage = '';
      if (response.status === 401) {
        errorMessage = 'This resource requires authentication. Please copy and paste the content directly.';
      } else if (response.status === 403) {
        errorMessage = 'Access to this resource is forbidden. Please copy and paste the content directly.';
      } else {
        errorMessage = `Failed to fetch URL (Status ${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error('URL does not point to readable content. Please copy and paste the content directly.');
    }

    let content = await response.text();
    console.log('Content fetched successfully, length:', content.length);

    // Clean up the content based on type
    if (type === 'google_doc') {
      // Basic HTML cleanup for Google Docs
      content = content
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim();
    } else {
      // Basic cleanup for other content
      content = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (!content.trim()) {
      throw new Error('No readable content found. Please copy and paste the content directly.');
    }

    // Process content with Gemini
    const prompt = `
    Analyze the following content from a ${type}. Extract the key information and requirements.
    If this is an assignment or task, identify:
    1. Main objectives
    2. Requirements
    3. Formatting guidelines
    4. Due dates or deadlines (if any)
    5. Any specific instructions or constraints

    Content:
    ${content.substring(0, 10000)} // Limit content length to avoid token limits

    Provide a structured response focusing on the essential information needed to complete the task.
    `;

    console.log('Sending to Gemini...');
    const result = await model.generateContent(prompt);
    const processedContent = result.response.text();

    console.log('Successfully processed content with Gemini');

    return new Response(
      JSON.stringify({
        success: true,
        content: processedContent,
        url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        suggestion: 'Try copying and pasting the content directly instead of using the URL.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
