import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, assignment, qualityConfig } = await req.json();
    console.log("Received request:", { type, content, assignment, qualityConfig });

    let result = "";

    switch (type) {
      case 'analyze_requirements':
        // Process the analysis request
        result = `## Assignment Analysis\n\n${content}\n\nKey Requirements:\n- Requirement 1\n- Requirement 2`;
        break;

      case 'generate_response':
        // Generate assignment response
        result = `Here's a response for ${assignment.name}:\n\n${assignment.description}\n\nQuality Level: ${qualityConfig?.targetGrade || 'A'}`;
        break;

      default:
        throw new Error(`Unknown request type: ${type}`);
    }

    console.log("Sending response:", { result });

    return new Response(
      JSON.stringify({ content: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
