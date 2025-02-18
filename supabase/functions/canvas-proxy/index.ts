
// Follow Deno standard for imports
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
    console.log('Received request for endpoint:', endpoint)

    if (!domain || !apiKey) {
      throw new Error('Missing required parameters: domain or apiKey')
    }

    const baseUrl = `https://${domain}/api/v1${endpoint}`
    console.log('Making request to:', baseUrl)

    const response = await fetch(baseUrl, {
      method: method || 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const responseData = await response.text()
    console.log('Canvas API response status:', response.status)

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}`)
    }

    // Try to parse as JSON, if it fails return the raw text
    let data
    try {
      data = JSON.parse(responseData)
    } catch (e) {
      console.error('Failed to parse JSON response:', e)
      data = responseData
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function Error:', error)
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
