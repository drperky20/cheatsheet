import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  url?: string;
  content?: string;
  type: 'google_doc' | 'external_link' | 'direct_input';
}

const GEMINI_MODEL = 'gemini-pro';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, content: directContent, type } = await req.json() as RequestBody;
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    let content = '';

    // If direct content is provided, use it
    if (directContent) {
      content = directContent;
      console.log('Using provided direct content');
    } 
    // Otherwise try to fetch from URL
    else if (url) {
      console.log(`Attempting to fetch content from URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });

      if (!response.ok) {
        throw new Error('URL requires authentication or is not accessible. Please paste the content directly.');
      }

      content = await response.text();
      
      // Clean up the content based on type
      if (type === 'google_doc' || type === 'external_link') {
        content = content
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } else {
      throw new Error('Either URL or direct content must be provided');
    }

    if (!content.trim()) {
      throw new Error('No content found to process');
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Process content with Gemini
    const prompt = `
    Analyze the following content${type !== 'direct_input' ? ' from a ' + type : ''}.
    Extract the key information and requirements.
    If this is an assignment or task, identify:
    1. Main objectives
    2. Requirements
    3. Formatting guidelines
    4. Due dates or deadlines (if any)
    5. Any specific instructions or constraints

    Content:
    ${content.substring(0, 10000)} // Limit content length

    Provide a structured response focusing on the essential information needed to complete the task.
    `;

    console.log('Processing content with Gemini...');
    const result = await model.generateContent(prompt);
    const processedContent = result.response.text();

    console.log('Successfully processed content');

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
        suggestion: 'Please paste the content directly into the chat'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
