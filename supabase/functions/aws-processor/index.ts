
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AUTOMATION_API_ENDPOINT = "https://o5y4yt3q3m.execute-api.us-east-2.amazonaws.com/prod/automate";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();

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

    // Call the Automation API
    const response = await fetch(AUTOMATION_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        type,
        task_id: automationResult.id
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const result = await response.json();

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
