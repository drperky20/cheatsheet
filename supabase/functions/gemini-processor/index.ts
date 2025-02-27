
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
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const requestData = await req.json();
    console.log('Request data:', requestData);

    const { content, type } = requestData;
    if (!content || !type) {
      throw new Error('Missing required fields: content or type');
    }

    console.log(`Processing ${type} with content length: ${content?.length}`);

    if (type === 'analyze_requirements') {
      // First, try to clean and validate the content
      const cleanContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
      if (!cleanContent.trim()) {
        throw new Error('Assignment content is empty after cleaning');
      }

      // Construct the prompt for assignment analysis
      const prompt = `
        Please analyze the following assignment requirements and provide a clear, structured summary:
        ${cleanContent}
        
        Focus on extracting:
        1. Main objectives and deliverables
        2. Due dates and deadlines
        3. Formatting requirements
        4. Grading criteria
        5. Any special instructions or notes
        
        Format the response in a clear, organized manner with sections.
      `;

      console.log('Making request to Gemini API...');
      
      // Make request to Gemini API with the correct authorization format
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        })
      });

      console.log('Gemini API response status:', response.status);
      const responseText = await response.text();
      console.log('Gemini API raw response:', responseText);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid Gemini response structure:', data);
        throw new Error('Invalid response format from Gemini API');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('Successfully generated analysis:', generatedText.substring(0, 100) + '...');

      return new Response(
        JSON.stringify({
          result: generatedText,
          success: true,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error(`Unknown request type: ${type}`);
  } catch (error) {
    console.error("Error in gemini-processor:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
