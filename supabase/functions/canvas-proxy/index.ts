
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { endpoint, method, domain, apiKey } = await req.json()
    
    // Build the URL with query parameters for active courses
    const baseUrl = `https://${domain}/api/v1${endpoint}`
    const url = new URL(baseUrl)
    
    // Add query parameters for active courses
    url.searchParams.append('include[]', 'term')
    url.searchParams.append('enrollment_state[]', 'active')
    url.searchParams.append('state[]', 'available')
    
    console.log('Requesting URL:', url.toString())

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Canvas API Error:', {
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log('Canvas API Response:', JSON.stringify(data, null, 2))

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
