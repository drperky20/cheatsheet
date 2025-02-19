
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { BrowserLauncher } from "https://deno.land/x/browser_launcher@0.1.0/mod.ts";
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

    // Initialize browser
    const browser = new BrowserLauncher();
    await browser.launch();

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    let content = '';

    if (type === 'google_doc') {
      // Extract content from Google Doc
      content = await page.evaluate(() => {
        const docContent = document.querySelector('.kix-appview-editor');
        return docContent ? docContent.textContent : '';
      });
    } else {
      // Extract content from general webpage
      content = await page.evaluate(() => {
        return document.body.innerText;
      });
    }

    await browser.close();

    return new Response(
      JSON.stringify({
        success: true,
        content,
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
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
