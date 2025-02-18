
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { content, type, level, config } = body;

    if (!content) {
      throw new Error('Content is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key');
    }

    let prompt = '';
    
    switch (type) {
      case 'generate_content':
        prompt = `Given this assignment description: "${content}", generate a well-written response that would receive a ${config?.targetGrade || 'B'} grade. 
                 Write in a ${config?.writingStyle || 'mixed'} style.`;
        break;
      
      case 'expand_text':
        prompt = `Expand this text while maintaining its core meaning and adding relevant details: "${content}"`;
        break;
      
      case 'shorten_text':
        prompt = `Summarize this text while preserving its key points: "${content}"`;
        break;
      
      case 'adjust_reading_level':
        const levelDescriptions = {
          'elementary': 'simple words and short sentences suitable for elementary school students',
          'middle_school': 'clear language appropriate for middle school students',
          'high_school': 'more sophisticated vocabulary suitable for high school students',
          'college': 'advanced vocabulary and complex sentence structures suitable for college level'
        };
        prompt = `Rewrite this text at a ${level} reading level using ${levelDescriptions[level]}: "${content}"`;
        break;
      
      case 'add_emojis':
        prompt = `Add appropriate emojis to enhance this text (not too many, just where they naturally fit): "${content}"`;
        break;
      
      case 'improve_writing':
        prompt = `Improve this text by enhancing clarity, fixing grammar, and making it more engaging while maintaining the original meaning: "${content}"`;
        break;
      
      case 'analyze_requirements':
        prompt = `Analyze this assignment and provide key requirements, guidelines, and suggestions for a successful submission: "${content}"`;
        break;
      
      default:
        throw new Error('Invalid operation type');
    }

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Gemini response:', data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    const result = data.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
