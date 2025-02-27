
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { promptType, assignment } = await req.json();
    console.log(`Processing ${promptType} for assignment: ${assignment?.name}`);

    if (promptType === 'generate_assignment_response') {
      const { description, name, qualityConfig } = assignment;

      // Construct a detailed prompt
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

      console.log("Sending prompt to Gemini...");
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("Received response from Gemini");

      return new Response(
        JSON.stringify({
          content: text,
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
