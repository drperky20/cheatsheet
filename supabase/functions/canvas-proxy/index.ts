
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
    
    if (!domain || !apiKey) {
      throw new Error('Missing required parameters: domain or apiKey')
    }

    // Function to fetch all pages of assignments
    async function getAllAssignments(baseUrl: string, apiKey: string) {
      let allAssignments = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = new URL(baseUrl);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('per_page', '100');
        url.searchParams.append('include[]', 'submission');
        url.searchParams.append('include[]', 'overrides');

        console.log(`Fetching page ${page} from: ${url.toString()}`);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          allAssignments = [...allAssignments, ...data];
          page++;
        } else {
          hasMore = false;
        }

        // Check the Link header for pagination
        const linkHeader = response.headers.get('Link');
        if (!linkHeader || !linkHeader.includes('rel="next"')) {
          hasMore = false;
        }
      }

      return allAssignments;
    }

    const baseUrl = `https://${domain}/api/v1${endpoint}`

    if (endpoint === '/courses') {
      const url = new URL(baseUrl);
      url.searchParams.append('enrollment_type', 'student');
      url.searchParams.append('enrollment_state', 'active');
      url.searchParams.append('state[]', 'available');
      url.searchParams.append('include[]', 'term');

      const response = await fetch(url.toString(), {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const currentCourses = Array.isArray(data) ? data.filter(course => course?.workflow_state === 'available') : [];
      
      return new Response(JSON.stringify(currentCourses), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (endpoint.includes('/assignments')) {
      const allAssignments = await getAllAssignments(baseUrl, apiKey);
      console.log(`Total assignments fetched: ${allAssignments.length}`);
      
      return new Response(JSON.stringify(allAssignments), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error('Invalid endpoint');
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
