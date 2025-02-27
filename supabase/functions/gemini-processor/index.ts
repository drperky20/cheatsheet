
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
      // Handle file upload case
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
      // Handle plain text request
      const jsonData = await req.json();
      const { content, type } = jsonData;
      
      let prompt = content;

      // Add different instructions based on type
      if (type === 'format_text') {
        prompt = `Please format the following text to be more clear, organized, and professional while maintaining the key points:\n\n${content}`;
      } else if (type === 'adjust_grade_level') {
        const level = jsonData.level || 8;
        prompt = `Please rewrite the following text to be appropriate for grade level ${level}, adjusting vocabulary and complexity accordingly:\n\n${content}`;
      }
      
      // Prepare the request for Gemini text-only
      reqBody = {
        contents: [
          {
            parts: [{ text: prompt }]
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Extract the generated text from Gemini's response
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate a response";
    
    // Return based on the request type
    if (contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const { type } = await req.json();
      if (type === 'format_text' || type === 'adjust_grade_level') {
        return new Response(JSON.stringify({ content: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
  } catch (error) {
    console.error('Error in gemini-processor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
