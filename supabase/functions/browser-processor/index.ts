
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`Processing ${type} at URL: ${url}`);

    // Forward to AWS processor
    try {
      const awsResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/aws-processor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ url, type, processedLinkId })
        }
      );

      if (!awsResponse.ok) {
        const errorText = await awsResponse.text();
        throw new Error(`AWS processor responded with ${awsResponse.status}: ${errorText}`);
      }

      const result = await awsResponse.json();

      return new Response(
        JSON.stringify(result), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (awsError) {
      console.error('Error calling AWS processor:', awsError);
      return new Response(
        JSON.stringify({ error: 'Failed to process with AWS', details: awsError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
