
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();
    
    console.log(`Direct processor received request for: ${url} (${type})`);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch content directly based on URL type
    let content = '';
    
    try {
      // Simple URL fetching implementation
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; LinkProcessor/1.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }
      
      // Extract text content depending on type
      if (type === 'google_doc') {
        const html = await response.text();
        // Simple text extraction - in reality, you would want more sophisticated parsing
        content = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } else {
        content = await response.text();
        content = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      
      // Update the processed link as completed
      const { error: updateError } = await supabase
        .from('processed_links')
        .update({
          status: 'completed',
          content: content || 'Successfully processed content',
          error: null
        })
        .eq('id', processedLinkId);

      if (updateError) {
        throw updateError;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { content }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (fetchError) {
      console.error('Error processing link:', fetchError);
      
      // Update processed link with error
      await supabase
        .from('processed_links')
        .update({
          status: 'failed',
          error: fetchError.message || 'Failed to process link content'
        })
        .eq('id', processedLinkId);
        
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in direct processor:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
