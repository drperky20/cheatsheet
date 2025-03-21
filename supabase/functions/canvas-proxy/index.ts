
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced cache with optimized TTL values
const cache = new Map();
const CACHE_TTL = {
  courses: 300000,      // 5 minutes for courses
  assignments: 900000,  // 15 minutes for assignments
  default: 120000       // 2 minutes for other endpoints
};

// Background task flag to track ongoing operations
const ongoingTasks = new Set();

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
    
    // Determine cache TTL based on endpoint type
    let cacheTtl = CACHE_TTL.default;
    if (endpoint.includes('/assignments')) {
      cacheTtl = CACHE_TTL.assignments;
    } else if (endpoint.includes('/courses') && !endpoint.includes('/assignments')) {
      cacheTtl = CACHE_TTL.courses;
    }
    
    // Check cache for GET requests if not explicitly bypassing cache
    const cacheKey = `${CANVAS_DOMAIN}:${endpoint}:${CANVAS_API_KEY}`;
    if ((method === 'GET' || !method) && !bypassCache) {
      if (cache.has(cacheKey)) {
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
      
      // Check if there's an ongoing request for this endpoint
      if (ongoingTasks.has(cacheKey)) {
        // Wait a bit and check cache again (another request might have populated it)
        await new Promise(resolve => setTimeout(resolve, 500));
        if (cache.has(cacheKey)) {
          const cachedData = cache.get(cacheKey);
          if (Date.now() < cachedData.expiry) {
            console.log(`[canvas-proxy] Cache hit after waiting for: ${url}`);
            return new Response(
              JSON.stringify(cachedData.data),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT-AFTER-WAIT' },
                status: 200,
              }
            );
          }
        }
      }
    }
    
    const headers = {
      'Authorization': `Bearer ${CANVAS_API_KEY}`,
      'Content-Type': 'application/json',
    };

    console.log(`[canvas-proxy] Making ${method || 'GET'} request to: ${url}`);
    
    // Mark this request as ongoing
    if ((method === 'GET' || !method)) {
      ongoingTasks.add(cacheKey);
    }
    
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
      const fetchPromise = fetch(url, {
        method: method || 'GET',
        headers,
        body,
      });
      
      // Set up a timeout for slow requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 20000);
      });
      
      // Race between the fetch and the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      const responseText = await response.text();
      
      // Remove from ongoing tasks
      if ((method === 'GET' || !method)) {
        ongoingTasks.delete(cacheKey);
      }
      
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
          // Use background task for caching to speed up response
          const cacheOperation = async () => {
            cache.set(cacheKey, {
              data,
              expiry: Date.now() + cacheTtl
            });
            console.log(`[canvas-proxy] Cached response for: ${url} with TTL: ${cacheTtl/1000}s`);
          };
          
          if (typeof EdgeRuntime !== 'undefined') {
            EdgeRuntime.waitUntil(cacheOperation());
          } else {
            // Fallback if waitUntil is not available
            cacheOperation();
          }
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
      // Remove from ongoing tasks on error
      if ((method === 'GET' || !method)) {
        ongoingTasks.delete(cacheKey);
      }
      
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
