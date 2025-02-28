
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from '@supabase/supabase-js';

const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
const AWS_REGION = Deno.env.get('AWS_REGION');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();

    // Create AWS Lambda client
    const lambda = new AWS.Lambda({
      region: AWS_REGION,
      credentials: new AWS.Credentials({
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

    if (insertError) throw insertError;

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

    const response = await lambda.invoke(params).promise();
    const result = JSON.parse(response.Payload as string);

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
