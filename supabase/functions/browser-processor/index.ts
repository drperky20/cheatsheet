
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set a reasonable timeout
    await page.setDefaultNavigationTimeout(30000);
    
    console.log(`Navigating to URL: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    let content = '';

    if (type === 'google_doc') {
      // Wait for Google Doc content to load
      await page.waitForSelector('.kix-appview-editor', { timeout: 5000 });
      
      content = await page.evaluate(() => {
        const docContent = document.querySelector('.kix-appview-editor');
        return docContent ? docContent.textContent || '' : '';
      });
    } else {
      // For regular web pages, get the main content
      content = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.getElementsByTagName('script');
        const styles = document.getElementsByTagName('style');
        
        for (const element of [...scripts, ...styles]) {
          element.remove();
        }
        
        // Get the text content
        return document.body.innerText || '';
      });
    }

    await browser.close();
    
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
    console.error('Browser processing error:', error);
    
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
