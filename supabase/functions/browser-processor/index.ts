
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as googleai from "@google/generative-ai";
import puppeteer from "puppeteer";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();

    // Initialize browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    
    console.log(`Processing ${type} URL: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      let content = '';
      
      if (type === 'google_doc') {
        content = await page.evaluate(() => {
          const docContent = document.querySelector('.kix-appview-editor');
          return docContent ? docContent.textContent : '';
        });
      } else {
        content = await page.evaluate(() => {
          return document.body.textContent || '';
        });
      }

      // Initialize Gemini
      const genAI = new googleai.GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Generate summary using Gemini
      const result = await model.generateContent(`Summarize this content concisely: ${content.substring(0, 5000)}`);
      const summary = result.response.text();

      await browser.close();

      const processedContent = {
        raw_content: content,
        summary: summary,
        processed_at: new Date().toISOString()
      };

      // Create Supabase client
      const supabase = await createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Create automation result
      const { data: automationResult, error: insertError } = await supabase
        .from('automation_results')
        .insert({
          url,
          task_id: crypto.randomUUID(),
          status: 'completed',
          result: processedContent,
          processed_link_id: processedLinkId
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(JSON.stringify({
        success: true,
        data: processedContent,
        automationId: automationResult.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      console.error('Error processing content:', error);
      await browser.close();
      throw error;
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
