
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface RequestBody {
  url?: string;
  content?: string;
  type: 'google_doc' | 'external_link' | 'direct_input';
  accessToken?: string;
}

const GEMINI_MODEL = 'gemini-pro';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, content: directContent, type, accessToken } = await req.json() as RequestBody;
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    let contentToProcess = '';

    // If direct content is provided, use it immediately
    if (directContent) {
      console.log('Processing direct content input');
      contentToProcess = directContent;
    } 
    // For URLs, attempt API-based access where possible
    else if (url) {
      console.log(`Processing URL: ${url}`);
      
      if (url.includes('docs.google.com')) {
        if (!accessToken) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Google authentication required',
              requiresAuth: true,
              authProvider: 'google'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401,
            }
          );
        }

        // Extract the document ID from the Google Docs URL
        const docId = url.match(/\/d\/(.*?)(\/|$)/)?.[1];
        if (!docId) {
          throw new Error('Invalid Google Docs URL');
        }

        try {
          // Attempt to fetch the document content using the Google Docs API
          const response = await fetch(
            `https://docs.googleapis.com/v1/documents/${docId}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to access Google Doc. Please ensure you have permission to view this document.');
          }

          const doc = await response.json();
          
          // Extract text content from the document
          let text = '';
          if (doc.body && doc.body.content) {
            const extractText = (content: any[]) => {
              for (const element of content) {
                if (element.paragraph) {
                  for (const pe of element.paragraph.elements) {
                    if (pe.textRun && pe.textRun.content) {
                      text += pe.textRun.content;
                    }
                  }
                }
                if (element.table) {
                  for (const row of element.table.tableRows) {
                    for (const cell of row.tableCells) {
                      if (cell.content) {
                        extractText(cell.content);
                      }
                    }
                  }
                }
              }
            };
            
            extractText(doc.body.content);
          }
          
          contentToProcess = text.trim();
        } catch (error) {
          console.error('Google Docs API error:', error);
          throw new Error('Failed to access Google Doc. Please copy and paste the content directly.');
        }
      } else {
        // For other URLs, attempt a simple fetch
        try {
          const response = await fetch(url, {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,text/plain',
            },
            redirect: 'follow',
          });

          if (!response.ok) {
            throw new Error('Unable to access URL. Please copy and paste the content directly.');
          }

          contentToProcess = await response.text();
        } catch (fetchError) {
          throw new Error('Unable to access URL. Please copy and paste the content directly.');
        }
      }
    } else {
      throw new Error('Please provide either a URL or content to process');
    }

    if (!contentToProcess.trim()) {
      throw new Error('No content found to process');
    }

    // Initialize Gemini and process the content
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `
    Analyze this ${type === 'direct_input' ? 'content' : type}:

    ${contentToProcess.substring(0, 10000)}

    Provide a detailed but concise analysis including:
    1. Main objectives or key points
    2. Requirements or expectations
    3. Important deadlines or dates
    4. Key instructions or guidelines
    5. Any specific formatting requirements
    `;

    console.log('Processing content with Gemini...');
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    return new Response(
      JSON.stringify({
        success: true,
        content: analysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        suggestion: 'For content requiring authentication, please copy and paste it directly into the chat'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
