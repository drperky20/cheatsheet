
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Assignment {
  name: string;
  description: string;
  points_possible: number;
  due_at: string;
}

type OperationType = 
  | 'generate_content'
  | 'adjust_text'
  | 'adjust_length'
  | 'adjust_reading_level'
  | 'improve_writing'
  | 'analyze_requirements';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type, level, config } = await req.json();
    console.log('Received request:', { type, config }); // Add logging

    const assignment = config?.assignment as Assignment | undefined;

    if (!content) {
      throw new Error('Content is required');
    }

    let prompt = '';
    let systemPrompt = '';
    
    if (assignment) {
      systemPrompt = `You are assisting with the following assignment:
        Title: ${assignment.name}
        Description: ${assignment.description}
        Points: ${assignment.points_possible}
        Due: ${new Date(assignment.due_at).toLocaleDateString()}
        
        Your goal is to generate B-grade student-quality work that:
        1. Shows understanding but allows for minor imperfections
        2. Uses natural, conversational language
        3. Maintains appropriate length and depth
        4. Includes occasional simple examples
        5. Avoids overly complex vocabulary
        
        Write as if you are a student completing this assignment.`;
    }

    switch (type as OperationType) {
      case 'generate_content':
        prompt = `Given this assignment: "${content}", generate a well-written response that would receive a B grade. 
                 Include some minor imperfections to sound natural. Use straightforward language and occasional personal insights.`;
        break;
      
      case 'adjust_text':
      case 'adjust_length':
        const lengthFactor = config?.lengthFactor || 1;
        const textType = config?.selection ? 'selected section' : 'entire text';
        prompt = `Adjust the length of this ${textType} by a factor of ${lengthFactor} (where 1 is original length): "${content}"
                 Maintain the same style and tone, but ${lengthFactor > 1 ? 'expand with relevant details and examples' : 'make more concise while keeping key points'}.`;
        break;
      
      case 'adjust_reading_level':
        const levelDescriptions = {
          'elementary': 'simple words and short sentences suitable for elementary school students',
          'middle_school': 'clear language appropriate for middle school students',
          'high_school': 'more sophisticated vocabulary suitable for high school students',
          'college': 'advanced vocabulary and complex sentence structures suitable for college level'
        };
        prompt = `Rewrite this text at a ${level} reading level using ${levelDescriptions[level]}: "${content}"
                 Maintain the core meaning and key points while adjusting the complexity.`;
        break;
      
      case 'improve_writing':
        prompt = `Improve this text while maintaining a natural student writing style:
                 "${content}"
                 
                 Guidelines:
                 1. Fix obvious grammar errors but leave some minor imperfections
                 2. Improve flow and clarity
                 3. Keep the language natural and conversational
                 4. Maintain the same general tone and complexity level
                 5. Don't make it sound too polished or professional`;
        break;
      
      case 'analyze_requirements':
        prompt = `Analyze this assignment description and provide key insights:
                 "${content}"
                 
                 Please identify:
                 1. Main objectives and deliverables
                 2. Key requirements and constraints
                 3. Suggested approach
                 4. Potential challenges
                 5. Tips for success`;
        break;
      
      default:
        console.error('Invalid operation type:', type);
        throw new Error(`Invalid operation type: ${type}`);
    }

    console.log('Sending prompt to Gemini:', prompt); // Add logging

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') || '',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();
    console.log('Gemini response:', data); // Add logging

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    return new Response(
      JSON.stringify({ result: data.candidates[0].content.parts[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in edge function:', error); // Add logging
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
