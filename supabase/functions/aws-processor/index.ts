
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Import AWS SDK for Deno
import { Lambda, Credentials } from "https://esm.sh/aws-sdk@2.1413.0";

const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
const AWS_REGION = Deno.env.get('AWS_REGION');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();
    
    console.log(`AWS Processor received request for: ${url} (${type})`);

    // Create AWS Lambda client
    const lambda = new Lambda({
      region: AWS_REGION,
      credentials: new Credentials({
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!
      })
    });

    // Create automation result record
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: automationResult, error: insertError } = await supabase
      .from('automation_results')
      .insert({
        url,
        status: 'processing',
        processed_link_id: processedLinkId
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting automation result:', insertError);
      throw insertError;
    }

    console.log(`Created automation result with ID: ${automationResult.id}`);

    // Invoke Lambda function
    const params = {
      FunctionName: 'link-processor',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        url,
        type,
        task_id: automationResult.id
      })
    };

    console.log(`Invoking AWS Lambda function with params:`, params);
    
    try {
      const response = await lambda.invoke(params).promise();
      const result = JSON.parse(response.Payload as string);
      
      console.log(`AWS Lambda response:`, result);

      // Update automation result
      const { error: updateError } = await supabase
        .from('automation_results')
        .update({
          status: result.success ? 'completed' : 'failed',
          result: result.success ? result.data : null,
          error: result.error || null
        })
        .eq('id', automationResult.id);

      if (updateError) {
        console.error('Error updating automation result:', updateError);
        throw updateError;
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (lambdaError) {
      console.error('Error invoking AWS Lambda:', lambdaError);
      
      // Update automation result to failed status
      await supabase
        .from('automation_results')
        .update({
          status: 'failed',
          error: lambdaError.message || 'AWS Lambda invocation failed'
        })
        .eq('id', automationResult.id);
        
      throw lambdaError;
    }
  } catch (error) {
    console.error('Error in AWS processor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
