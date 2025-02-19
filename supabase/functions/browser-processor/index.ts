
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

    let contentToProcess = '';

    // If direct content is provided, use it immediately
    if (directContent) {
      console.log('Processing direct content input');
      contentToProcess = directContent;
    } 
    // For URLs, attempt API-based access where possible
    else if (url) {
      console.log(`Processing URL: ${url}`);
      
      if (url.includes('docs.google.com')) {
        throw new Error('Google Docs requires authentication. Please copy and paste the document content directly.');
      }

      // For other URLs, attempt a simple fetch but expect it might fail
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,text/plain',
          },
          redirect: 'follow',
        });

        if (!response.ok) {
          throw new Error('Unable to access URL. Please copy and paste the content directly.');
        }

        contentToProcess = await response.text();
      } catch (fetchError) {
        throw new Error('Unable to access URL. Please copy and paste the content directly.');
      }
    } else {
      throw new Error('Please provide either a URL or content to process');
    }

    // Initialize Gemini and process the content
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `
    Analyze this ${type === 'direct_input' ? 'content' : type}:

    ${contentToProcess.substring(0, 10000)}

    Provide a detailed but concise analysis including:
    1. Main objectives or key points
    2. Requirements or expectations
    3. Important deadlines or dates
    4. Key instructions or guidelines
    5. Any specific formatting requirements
    `;

    console.log('Sending to Gemini for analysis...');
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    return new Response(
      JSON.stringify({
        success: true,
        content: analysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        suggestion: 'For content requiring authentication, please copy and paste it directly into the chat'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
