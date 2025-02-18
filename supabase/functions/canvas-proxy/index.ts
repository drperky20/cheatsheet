
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const url = `https://${CANVAS_DOMAIN}/api/v1${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${CANVAS_API_KEY}`,
    };

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
    }

    console.log(`Making ${method} request to: ${url}`);
    
    const response = await fetch(url, {
      method: method || 'GET',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

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
