
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  url: string;
  type: 'google_doc' | 'external_link';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type } = await req.json() as RequestBody;
    
    console.log(`Processing URL: ${url} of type: ${type}`);

    // Fetch the content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Basic HTML parsing without browser automation
    let content = '';
    
    if (type === 'google_doc') {
      // Extract content between specific Google Doc markers
      const docContent = html.match(/<div[^>]*class="[^"]*kix-appview-editor[^"]*"[^>]*>(.*?)<\/div>/s);
      content = docContent ? cleanHtml(docContent[1]) : 'Could not extract Google Doc content';
    } else {
      // For regular pages, extract content from the body
      const bodyContent = html.match(/<body[^>]*>(.*?)<\/body>/s);
      content = bodyContent ? cleanHtml(bodyContent[1]) : 'Could not extract page content';
    }

    console.log('Successfully processed URL');

    return new Response(
      JSON.stringify({
        success: true,
        content: content.trim(),
        url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to clean HTML content
function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
