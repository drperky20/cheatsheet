
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
    
    // Validate required parameters
    if (!domain || !apiKey) {
      throw new Error('Missing required parameters: domain or apiKey')
    }

    // Build the URL with appropriate query parameters
    const baseUrl = `https://${domain}/api/v1${endpoint}`
    const url = new URL(baseUrl)
    
    // Add different query parameters based on the endpoint type
    if (endpoint.includes('/courses') && !endpoint.includes('/assignments')) {
      // Parameters for courses endpoint
      url.searchParams.append('enrollment_state', 'active')
      url.searchParams.append('include[]', 'term')
    } else if (endpoint.includes('/assignments')) {
      // Parameters for assignments endpoint
      url.searchParams.append('order_by', 'due_at')
      url.searchParams.append('include[]', 'submission')
      url.searchParams.append('include[]', 'overrides')
      url.searchParams.append('per_page', '50')
      url.searchParams.append('bucket', 'upcoming')
    }
    
    console.log('Requesting Canvas API URL:', url.toString())

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    // Get the response text first to see what the error might be
    const responseText = await response.text()
    console.log('Canvas API Raw Response:', responseText)

    if (!response.ok) {
      console.error('Canvas API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      })
      throw new Error(`Canvas API error: ${response.status} ${response.statusText} - ${responseText}`)
    }

    // Parse the response text as JSON
    const data = JSON.parse(responseText)
    
    // Apply different filters based on the endpoint
    if (endpoint.includes('/courses') && !endpoint.includes('/assignments')) {
      // Filter courses
      const currentCourses = Array.isArray(data) ? data.filter((course: any) => {
        if (!course) return false
        return course.workflow_state === 'available'
      }) : []
      
      console.log('Filtered current courses:', JSON.stringify(currentCourses, null, 2))
      return new Response(JSON.stringify(currentCourses), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // Filter assignments
      const activeAssignments = Array.isArray(data) ? data.filter((assignment: any) => {
        if (!assignment) return false
        return assignment.published !== false && !assignment.locked_for_user
      }) : []
      
      console.log('Filtered active assignments:', JSON.stringify(activeAssignments, null, 2))
      return new Response(JSON.stringify(activeAssignments), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
  } catch (error) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
