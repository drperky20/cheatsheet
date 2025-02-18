
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
      const errorText = await response.text()
      let errorMessage = `Canvas API error: ${response.status} ${response.statusText}`
      
      // Try to parse the error response
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMessage = `Canvas API error: ${errorJson.errors[0].message}`
          
          // If it's an authorization error, add helpful message
          if (response.status === 403) {
            errorMessage += "\n\nPlease check that your Canvas API key has the following permissions:\n" +
                          "- View grades\n" +
                          "- Read course content\n" +
                          "- Read course list\n" +
                          "- Read student enrollments"
          }
        }
      } catch (e) {
        // If we can't parse the JSON, use the raw error text
        errorMessage += `\nDetails: ${errorText}`
      }

      console.error('Canvas API error details:', {
        status: response.status,
        statusText: response.statusText,
        responseBody: errorText,
        url: baseUrl,
      })
      
      throw new Error(errorMessage)
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
