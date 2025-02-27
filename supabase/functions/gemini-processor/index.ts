
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  promptType: string;
  assignment: {
    name: string;
    description: string;
    qualityConfig: {
      grade: string;
      wordCount: number;
      citationCount: number;
      factualAccuracy: boolean;
    };
  };
}

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

    const { promptType, assignment } = await req.json() as GenerateRequest;
    console.log(`Processing ${promptType} for assignment: ${assignment?.name}`);

    if (promptType === 'generate_assignment_response') {
      const { description, name, qualityConfig } = assignment;

      // Construct the prompt
      const prompt = `
        Assignment: ${name}
        Description: ${description}
        Requirements:
        - Grade Level: ${qualityConfig.grade}
        - Word Count: ${qualityConfig.wordCount} words
        - Citations Required: ${qualityConfig.citationCount}
        - Ensure Factual Accuracy: ${qualityConfig.factualAccuracy}

        Please generate a detailed, well-structured response that meets all the above requirements.
        Use appropriate academic language and provide clear organization with headers where relevant.
      `;

      // Make request to Gemini API directly
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;

      console.log("Successfully generated response");

      return new Response(
        JSON.stringify({
          content: generatedText,
          success: true,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error(`Unknown prompt type: ${promptType}`);
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
