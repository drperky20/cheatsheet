
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { LambdaClient, InvokeCommand } from "https://esm.sh/@aws-sdk/client-lambda@3.535.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();

    // Create AWS Lambda client
    const lambda = new LambdaClient({
      region: Deno.env.get('AWS_REGION'),
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create automation result record
    const { data: automationResult, error: insertError } = await supabase
      .from('automation_results')
      .insert({
        url,
        task_id: crypto.randomUUID(),
        status: 'processing',
        processed_link_id: processedLinkId
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Invoke Lambda function
    const command = new InvokeCommand({
      FunctionName: 'link-processor',
      InvocationType: 'RequestResponse',
      Payload: new TextEncoder().encode(JSON.stringify({
        url,
        type,
        task_id: automationResult.id
      }))
    });

    const response = await lambda.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));

    // Update automation result
    const { error: updateError } = await supabase
      .from('automation_results')
      .update({
        status: result.success ? 'completed' : 'failed',
        result: result.success ? result.data : null,
        error: result.error || null
      })
      .eq('id', automationResult.id);

    if (updateError) throw updateError;

    console.log(`Processed link ${url} with result:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
