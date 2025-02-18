
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
    // Parse request body
    const { endpoint, method, domain, apiKey } = await req.json()
    console.log('Received request for endpoint:', endpoint)

    if (!domain || !apiKey) {
      throw new Error('Missing required parameters: domain or apiKey')
    }

    // Construct Canvas API URL
    const baseUrl = `https://${domain}/api/v1${endpoint}`
    console.log('Making request to:', baseUrl)

    // Make request to Canvas API
    const response = await fetch(baseUrl, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    // Check for Canvas API errors
    if (!response.ok) {
      console.error('Canvas API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}\n${errorText}`)
    }

    // Parse and return response
    const responseData = await response.json()
    console.log('Successfully retrieved data from Canvas API')

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function Error:', error)
    
    // Determine if error is from Canvas API or internal
    const errorMessage = error.message || 'An unexpected error occurred'
    const statusCode = errorMessage.includes('Canvas API error') ? 502 : 500

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    )
  }
})
