
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

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
    const { content, type } = await req.json();
    
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
        throw new Error("Invalid processing type");
    }

    console.log(`Processing ${type} request with Gemini...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ result: text }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error processing with Gemini:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
