
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Gateway endpoint for the FastAPI service
const AUTOMATION_API_ENDPOINT = "https://o5y4yt3q3m.execute-api.us-east-2.amazonaws.com/prod/automate";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();
    
    console.log(`Starting automation request for URL: ${url}, Type: ${type}, ID: ${processedLinkId}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Initialized Supabase client');

    // Create automation result record
    console.log('Creating initial automation record...');
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

    if (insertError) {
      console.error('Failed to create automation record:', insertError);
      throw insertError;
    }

    console.log('Created automation record:', automationResult.id);

    // Call the FastAPI Automation endpoint
    console.log('Calling FastAPI automation service...');
    const response = await fetch(AUTOMATION_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        type,
        task_id: automationResult.id,
        instructions: type === 'google_doc' ? 'extract_content' : 'analyze_webpage'
      })
    });

    // Log the raw response for debugging
    console.log('Automation API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Automation API error:', errorText);
      
      // Update automation result with error
      await supabase
        .from('automation_results')
        .update({
          status: 'failed',
          error: `API Error: ${response.status} - ${errorText}`
        })
        .eq('id', automationResult.id);

      throw new Error(`Automation API failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Received automation result:', result);

    // Update automation result with success
    console.log('Updating automation record with results...');
    const { error: updateError } = await supabase
      .from('automation_results')
      .update({
        status: 'completed',
        result: result.result || result,
        error: null
      })
      .eq('id', automationResult.id);

    if (updateError) {
      console.error('Failed to update automation record:', updateError);
      throw updateError;
    }

    console.log(`Successfully completed automation for ${url}`);

    return new Response(JSON.stringify({
      success: true,
      data: result.result || result,
      automationId: automationResult.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in automation process:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
