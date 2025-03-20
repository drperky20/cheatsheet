
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { endpoint, method, formData, domain, apiKey } = await req.json();

    if (!endpoint) {
      throw new Error('Endpoint is required');
    }

    const CANVAS_DOMAIN = domain || Deno.env.get('CANVAS_DOMAIN');
    const CANVAS_API_KEY = apiKey || Deno.env.get('CANVAS_API_KEY');

    if (!CANVAS_DOMAIN || !CANVAS_API_KEY) {
      throw new Error('Canvas configuration is incomplete');
    }

    // Construct the full Canvas API URL
    const url = `https://${CANVAS_DOMAIN}/api/v1${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${CANVAS_API_KEY}`,
      'Content-Type': 'application/json',
    };

    console.log(`[canvas-proxy] Making ${method || 'GET'} request to: ${url}`);
    
    let body;
    if (formData) {
      const form = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (value instanceof Blob) {
          form.append(key, value, (value as any).name);
        } else {
          form.append(key, value as string);
        }
      }
      body = form;
      // Remove Content-Type header when using FormData
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      method: method || 'GET',
      headers,
      body,
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`[canvas-proxy] Canvas API error: ${response.status} ${response.statusText}`);
      console.error(`[canvas-proxy] Response body: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
      
      return new Response(
        JSON.stringify({ 
          error: `Canvas API error: ${response.status} ${response.statusText}`,
          details: responseText.substring(0, 1000)
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        }
      );
    }

    // Try to parse as JSON, but handle if it's not valid JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`[canvas-proxy] Successfully retrieved data from Canvas API`);
    } catch (e) {
      console.error(`[canvas-proxy] Failed to parse response as JSON: ${e.message}`);
      data = { raw: responseText };
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[canvas-proxy] Error:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
