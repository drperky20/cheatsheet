
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
  | 'analyze_requirements'
  | 'generate';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type, level, config } = await req.json();
    console.log('Received request:', { type, content, config });

    // For 'generate' type, content is optional
    if (!content && type !== 'generate') {
      throw new Error('Content is required');
    }

    const assignment = config?.assignment as Assignment | undefined;
    
    let prompt = '';
    let systemPrompt = '';
    
    if (assignment) {
      systemPrompt = `You are a middle school student. When writing, you should:
        1. Use casual, natural language with occasional slang
        2. Make common punctuation and grammar mistakes
        3. Use simpler vocabulary and sometimes repeat words
        4. Write in a more personal, informal tone
        5. Include occasional text-speak or abbreviations
        6. Make some logical leaps without full explanation
        7. Show basic understanding but avoid complex analysis
        8. Use "like" and "basically" occasionally
        9. Start sentences with "And" or "But" sometimes
        10. Write with enthusiasm but limited sophistication

        Assignment Details:
        Title: ${assignment.name}
        Description: ${assignment.description}
        Points: ${assignment.points_possible}
        Due: ${new Date(assignment.due_at).toLocaleDateString()}`;
    }

    switch (type as OperationType) {
      case 'generate':
        prompt = `Write a response to this assignment as if you're a real middle school student trying to get a B grade. Be natural and informal, make occasional mistakes, and don't be too sophisticated. Use the assignment details as your guide:

        Assignment: ${assignment?.description || "Write a response"}

        Guidelines:
        1. Start with a basic introduction
        2. Use simple examples and explanations
        3. Include some personal opinions or experiences
        4. Make a few minor mistakes to seem authentic
        5. End with a basic conclusion`;
        break;

      case 'generate_content':
        prompt = `Write a response to this assignment as if you're a real middle school student trying to get a B grade. Be natural and informal, make occasional mistakes, and don't be too sophisticated: "${content}"`;
        break;
      
      case 'adjust_text':
      case 'adjust_length':
        const lengthFactor = config?.lengthFactor || 1;
        prompt = `${lengthFactor > 1 ? 'Make this longer' : 'Make this shorter'} while keeping the same casual, student-like style. 
                 Original text: "${content}"
                 
                 Guidelines:
                 1. Keep the informal, natural tone
                 2. ${lengthFactor > 1 ? 'Add more examples and personal thoughts' : 'Keep the main points but be more concise'}
                 3. Maintain any existing mistakes or casual language
                 4. Stay at a middle school writing level`;
        break;
      
      case 'adjust_reading_level':
        const levelPersonas = {
          'elementary': 'a 5th grader',
          'middle_school': 'an 8th grader',
          'high_school': 'an 11th grader',
          'college': 'a college sophomore'
        };
        prompt = `Rewrite this as if you're ${levelPersonas[level]} talking about what you learned in class:
                 "${content}"
                 
                 Make it sound natural and age-appropriate, including typical writing patterns and occasional mistakes for that age group.`;
        break;
      
      case 'improve_writing':
        prompt = `Make this writing better while keeping it realistic for a middle school student:
                 "${content}"
                 
                 Guidelines:
                 1. Fix major errors but leave some natural mistakes
                 2. Keep the casual, personal tone
                 3. Use age-appropriate vocabulary
                 4. Add some filler words like "like" and "basically"
                 5. Include some incomplete thoughts or tangents
                 6. Make transitions a bit awkward sometimes
                 7. Keep explanations simple`;
        break;
      
      default:
        console.error('Invalid operation type:', type);
        throw new Error(`Invalid operation type: ${type}`);
    }

    console.log('Sending prompt to Gemini:', prompt);

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
    console.log('Gemini response:', data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    return new Response(
      JSON.stringify({ result: data.candidates[0].content.parts[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
