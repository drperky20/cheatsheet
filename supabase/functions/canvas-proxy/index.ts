
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { endpoint, method, domain, apiKey } = await req.json()
    
    // Add more detailed logging
    console.log('Request details:', {
      endpoint,
      method,
      domain,
      hasApiKey: !!apiKey,
    })

    if (!domain || !apiKey) {
      throw new Error('Missing required parameters: domain or apiKey')
    }

    // Ensure the domain format is correct
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const baseUrl = `https://${cleanDomain}/api/v1${endpoint}`
    console.log('Making request to:', baseUrl)

    // Log headers (without exposing the full API key)
    console.log('Request headers:', {
      Authorization: apiKey ? `Bearer ${apiKey.substring(0, 5)}...` : 'Missing',
      'Content-Type': 'application/json'
    })

    const response = await fetch(baseUrl, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // Add more detailed error logging
      const errorText = await response.text()
      console.error('Canvas API error details:', {
        status: response.status,
        statusText: response.statusText,
        responseBody: errorText,
        url: baseUrl,
      })
      
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}\nDetails: ${errorText}`)
    }

    const responseData = await response.json()
    console.log('Successfully retrieved data from Canvas API')

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function Error:', {
      message: error.message,
      stack: error.stack,
    })

    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
