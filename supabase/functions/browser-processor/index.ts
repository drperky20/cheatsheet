
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  url: string;
  type: 'google_doc' | 'external_link';
}

const GEMINI_MODEL = 'gemini-pro';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type } = await req.json() as RequestBody;
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    console.log(`Processing ${type} URL: ${url}`);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('Browser launched');

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);

    console.log('Navigating to page...');
    await page.goto(url, { waitUntil: 'networkidle0' });

    let content = '';

    if (type === 'google_doc') {
      try {
        await page.waitForSelector('.kix-appview-editor', { timeout: 5000 });
        content = await page.evaluate(() => {
          const docContent = document.querySelector('.kix-appview-editor');
          return docContent ? docContent.textContent || '' : '';
        });
      } catch (error) {
        console.error('Error extracting Google Doc content:', error);
        content = await page.evaluate(() => document.body.innerText);
      }
    } else {
      content = await page.evaluate(() => {
        // Remove unwanted elements
        const elementsToRemove = document.querySelectorAll('script, style, link, meta');
        elementsToRemove.forEach(el => el.remove());
        
        return document.body.innerText;
      });
    }

    await browser.close();
    console.log('Browser closed');

    // Process content with Gemini
    const prompt = `
    Analyze the following content from a ${type}. Extract the key information and requirements.
    If this is an assignment or task, identify:
    1. Main objectives
    2. Requirements
    3. Formatting guidelines
    4. Due dates or deadlines (if any)
    5. Any specific instructions or constraints

    Content:
    ${content}

    Provide a structured response focusing on the essential information needed to complete the task.
    `;

    console.log('Sending to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const processedContent = response.text();

    console.log('Successfully processed content with Gemini');

    return new Response(
      JSON.stringify({
        success: true,
        content: processedContent,
        url,
        raw_content: content
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
