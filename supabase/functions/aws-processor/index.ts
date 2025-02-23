
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AUTOMATION_API_ENDPOINT = "https://o5y4yt3q3m.execute-api.us-east-2.amazonaws.com/prod/automate";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();
    
    console.log(`Processing request for URL: ${url}, Type: ${type}, ID: ${processedLinkId}`);

    // Get AWS credentials from environment
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION');

    if (!awsAccessKeyId || !awsSecretKey || !awsRegion) {
      throw new Error('Missing AWS credentials');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Create automation result record
    console.log('Creating automation result record...');
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
      console.error('Error creating automation result:', insertError);
      throw insertError;
    }

    console.log('Created automation result:', automationResult);

    // Call the Automation API with AWS credentials
    console.log('Calling Automation API...');
    const response = await fetch(AUTOMATION_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': awsAccessKeyId,
        'X-API-Secret': awsSecretKey,
        'X-API-Region': awsRegion
      },
      body: JSON.stringify({
        url,
        type,
        task_id: automationResult.id
      })
    });

    // Log the full response for debugging
    console.log('Raw API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response not OK:', response.status, errorText);
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Received API response:', result);

    // Update automation result
    console.log('Updating automation result...');
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

    console.log(`Successfully processed link ${url}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in aws-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      name: error.name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
