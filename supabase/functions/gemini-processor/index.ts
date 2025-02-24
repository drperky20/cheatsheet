
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    let reqBody;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const question = formData.get('question') as string;
      
      // Convert file to base64
      const fileBuffer = await file.arrayBuffer();
      const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
      
      // Get file mime type
      const mimeType = file.type;

      // Prepare the request for Gemini with file
      reqBody = {
        contents: [
          {
            parts: [
              {
                text: question || "Please analyze this file and provide insights:",
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: fileBase64
                }
              }
            ]
          }
        ]
      };
    } else {
      const { content, type } = await req.json();
      
      // Prepare the request for Gemini text-only
      reqBody = {
        contents: [
          {
            parts: [{ text: content }]
          }
        ]
      };
    }

    // Make request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
      }
    );

    const data = await response.json();

    // Extract the generated text from Gemini's response
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate a response";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-processor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
