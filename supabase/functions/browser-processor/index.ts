
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, type, processedLinkId } = await req.json();
    
    console.log(`Starting browser automation for URL: ${url}, Type: ${type}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !geminiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const genAI = new GoogleGenerativeAI(geminiKey);

    // Create automation result record
    console.log('Creating automation record...');
    const { data: automationResult, error: insertError } = await supabase
      .from('automation_results')
      .insert({
        url,
        task_id: crypto.randomUUID(),
        status: 'processing',
        processed_link_id: processedLinkId
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create automation record:', insertError);
      throw insertError;
    }

    // Launch browser and process the URL
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      console.log(`Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      let content = '';
      let error = null;

      if (type === 'google_doc') {
        try {
          // Handle Google Docs
          console.log('Processing Google Doc...');
          
          // Wait for the main editor content
          await page.waitForSelector('.kix-appview-editor', { timeout: 10000 });
          
          // Extract text content
          content = await page.evaluate(() => {
            const editor = document.querySelector('.kix-appview-editor');
            return editor ? editor.textContent : '';
          });

        } catch (e) {
          error = `Failed to extract Google Doc content: ${e.message}`;
          console.error(error);
        }
      } else {
        // Handle other webpage types
        console.log('Processing webpage...');
        
        // Get page content
        content = await page.evaluate(() => {
          const article = document.querySelector('article') || document.body;
          return article.textContent;
        });
      }

      // Use Gemini to analyze and summarize the content
      if (content && !error) {
        console.log('Analyzing content with Gemini...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Analyze and summarize the following content from a ${type}. 
        Focus on the main points and key information:
        
        ${content.substring(0, 5000)}`;  // Limit content length

        const result = await model.generateContent(prompt);
        const response = await result.response;
        content = response.text();
      }

      // Update automation result
      console.log('Updating automation record...');
      const { error: updateError } = await supabase
        .from('automation_results')
        .update({
          status: error ? 'failed' : 'completed',
          result: error ? null : { content },
          error: error
        })
        .eq('id', automationResult.id);

      if (updateError) {
        throw updateError;
      }

      await browser.close();

      return new Response(JSON.stringify({
        success: !error,
        data: error ? null : { content },
        error: error
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error ? 500 : 200,
      });

    } finally {
      await browser.close();
    }

  } catch (error) {
    console.error('Error in browser automation:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
