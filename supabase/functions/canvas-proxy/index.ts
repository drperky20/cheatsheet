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
    url.searchParams.append('enrollment_type[]', 'student')
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
    
    console.log('Raw Canvas response:', JSON.stringify(data, null, 2))

    // Filter to only show current courses
    const now = new Date()
    const currentCourses = Array.isArray(data) ? data.filter((course: any) => {
      // If the course has a term, check its dates
      if (course.term) {
        const termEndDate = course.term.end_at ? new Date(course.term.end_at) : null
        // Keep courses that either:
        // 1. Have no end date (ongoing courses)
        // 2. End date is in the future
        return !termEndDate || termEndDate > now
      }
      // If no term info, check if course is marked as concluded
      return !course.concluded
    }) : []

    console.log('Filtered current courses:', JSON.stringify(currentCourses, null, 2))

    return new Response(JSON.stringify(currentCourses), {
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
