
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache with expiration
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutes in milliseconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method, formData, domain, apiKey, bypassCache } = await req.json();

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
    
    // Check cache for GET requests if not explicitly bypassing cache
    const cacheKey = `${CANVAS_DOMAIN}:${endpoint}:${CANVAS_API_KEY}`;
    if (method === 'GET' || !method) {
      if (!bypassCache && cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        if (Date.now() < cachedData.expiry) {
          console.log(`[canvas-proxy] Cache hit for: ${url}`);
          return new Response(
            JSON.stringify(cachedData.data),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
              status: 200,
            }
          );
        } else {
          // Cache expired, remove it
          cache.delete(cacheKey);
        }
      }
    }
    
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

    try {
      const response = await fetch(url, {
        method: method || 'GET',
        headers,
        body,
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error(`[canvas-proxy] Canvas API error: ${response.status} ${response.statusText}`);
        console.error(`[canvas-proxy] Response body: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
        
        // Parse Canvas error message when possible
        let errorDetails = responseText;
        let errorType = "api_error";
        
        try {
          const errorJson = JSON.parse(responseText);
          if (errorJson.errors && Array.isArray(errorJson.errors)) {
            errorDetails = errorJson.errors.map(e => e.message || JSON.stringify(e)).join(", ");
          } else if (errorJson.message) {
            errorDetails = errorJson.message;
          }
          
          // Detect specific error types
          if (response.status === 401) {
            errorType = "auth_error";
            
            // Check for revoked token
            if (errorDetails.includes("token") || 
                errorDetails.toLowerCase().includes("unauthorized") || 
                errorDetails.toLowerCase().includes("revoked")) {
              errorType = "token_revoked";
            }
          }
        } catch (e) {
          // If we can't parse the error as JSON, use the raw text
        }
        
        return new Response(
          JSON.stringify({ 
            error: `Canvas API error: ${response.status} ${response.statusText}`,
            details: errorDetails,
            type: errorType
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
        
        // Cache successful GET responses
        if ((method === 'GET' || !method) && data) {
          cache.set(cacheKey, {
            data,
            expiry: Date.now() + CACHE_TTL
          });
          console.log(`[canvas-proxy] Cached response for: ${url}`);
        }
      } catch (e) {
        console.error(`[canvas-proxy] Failed to parse response as JSON: ${e.message}`);
        data = { raw: responseText };
      }

      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
          status: 200,
        }
      );
    } catch (fetchError) {
      console.error(`[canvas-proxy] Fetch error:`, fetchError);
      return new Response(
        JSON.stringify({ 
          error: `Canvas API fetch error: ${fetchError.message}`,
          details: "There was a problem connecting to the Canvas API. Please check your domain and API key.",
          type: "connection_error"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error('[canvas-proxy] Error:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "There was a problem processing your request. Please check your Canvas configuration.",
        type: "request_error"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
