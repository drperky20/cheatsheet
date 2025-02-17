
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
    
    if (endpoint === '/courses') {
      // Parameters for courses endpoint
      url.searchParams.append('enrollment_type', 'student')
      url.searchParams.append('enrollment_state', 'active')
      url.searchParams.append('state[]', 'available')
      url.searchParams.append('include[]', 'term')
    } else if (endpoint.includes('/assignments')) {
      // Parameters for assignments endpoint
      url.searchParams.append('order_by', 'due_at')
      url.searchParams.append('include[]', 'submission')
      url.searchParams.append('include[]', 'overrides')
      url.searchParams.append('per_page', '100') // Increased to get more assignments
      url.searchParams.append('sort', 'due_at')
      url.searchParams.append('order', 'desc') // Newest first
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
    
    if (endpoint === '/courses') {
      // Filter courses to only include current courses
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
      // Filter assignments to show relevant ones
      const now = new Date()
      const threeMonthsAgo = new Date(now)
      threeMonthsAgo.setMonth(now.getMonth() - 3)
      
      const activeAssignments = Array.isArray(data) ? data.filter((assignment: any) => {
        if (!assignment) return false
        
        // Only show published assignments
        if (!assignment.published) return false
        
        // Parse the due date
        const dueDate = assignment.due_at ? new Date(assignment.due_at) : null
        
        // Include assignments that:
        // 1. Are due in the future, or
        // 2. Were due within the last 3 months and aren't submitted yet
        return (
          assignment.published && 
          (
            (dueDate && dueDate > now) || // Future assignments
            (dueDate && dueDate > threeMonthsAgo && 
             (!assignment.submission || assignment.submission.workflow_state !== 'graded'))
          )
        )
      }) : []
      
      // Sort by due date (newest first)
      activeAssignments.sort((a: any, b: any) => {
        const dateA = a.due_at ? new Date(a.due_at) : new Date(0)
        const dateB = b.due_at ? new Date(b.due_at) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
      
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
