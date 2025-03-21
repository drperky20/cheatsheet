
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
    let content, type, level, config;
    
    // Check if we're dealing with multipart form data
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      content = await file.text();
      type = 'analyze_document';
      config = { 
        question: formData.get('question') || '',
        filename: file.name 
      };
    } else {
      // JSON request
      const requestData = await req.json();
      content = requestData.content;
      type = requestData.type;
      level = requestData.level;
      config = requestData.config;
    }
    
    console.log('Received request:', { type, contentPreview: content?.substring(0, 100), config });

    // For 'generate' type, content is optional
    if (!content && type !== 'generate') {
      throw new Error('Content is required');
    }

    const assignment = config?.assignment as Assignment | undefined;
    
    let prompt = '';
    let systemPrompt = '';
    let enhancedAssignmentDescription = '';
    
    // If it's a generate request and we have an assignment, first analyze the requirements
    if (type === 'generate' && assignment) {
      try {
        console.log('Preprocessing assignment requirements for better generation...');
        
        // Create a prompt for analyzing requirements
        const analysisPrompt = `Analyze this assignment description:
        ${assignment.description}
        
        Extract and structure the following key details:
        1. Core requirements (what needs to be done)
        2. Format/structure requirements
        3. Word count or length expectations
        4. Key topics or points to address
        5. Grading criteria, if mentioned
        
        Return ONLY the structured analysis that can be used as input for content generation.`;
        
        // Call Gemini API to analyze requirements
        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
          throw new Error('API key for Gemini is not configured');
        }
        
        const analysisResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: analysisPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        });
        
        if (!analysisResponse.ok) {
          console.warn('Failed to analyze requirements, proceeding with original description');
        } else {
          const analysisData = await analysisResponse.json();
          if (analysisData.candidates?.[0]?.content?.parts?.[0]?.text) {
            enhancedAssignmentDescription = analysisData.candidates[0].content.parts[0].text;
            console.log('Successfully pre-processed assignment requirements');
          }
        }
      } catch (error) {
        console.error('Error preprocessing requirements:', error);
        // Continue with original description if analysis fails
      }
    }
    
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
      case 'analyze_requirements':
        prompt = `Help me understand this: "${content}"
                 
                 Break it down like a middle school student would:
                 1. What do I actually have to do?
                 2. What's the main point?
                 3. How long does it need to be?
                 4. What should I include?
                 5. When is it due?
                 
                 Keep it simple and use casual language, like you're explaining it to a friend.`;
        break;

      case 'generate':
        prompt = `Write a response to this assignment as if you're a real middle school student trying to get a B grade. Be natural and informal, make occasional mistakes, and don't be too sophisticated. Use the assignment details as your guide:

        Assignment: ${enhancedAssignmentDescription || assignment?.description || "Write a response"}

        Guidelines:
        1. Start with a basic introduction
        2. Use simple examples and explanations
        3. Include some personal opinions or experiences
        4. Make a few minor mistakes to seem authentic
        5. End with a basic conclusion
        
        Write a complete response that would be typical for a middle school student.`;
        break;

      case 'generate_content':
        prompt = `Write a response to this assignment as if you're a real middle school student trying to get a B grade. Be natural and informal, make occasional mistakes, and don't be too sophisticated: "${content}"`;
        break;
      
      case 'analyze_document':
        prompt = `You're a helpful AI assistant for a middle school student. Analyze this document and provide helpful insights:
        
        Document: "${content}"
        ${config.question ? `Student's question: ${config.question}` : ''}
        
        Provide a comprehensive but simple analysis that a middle school student would understand. Include:
        1. Main topics and key points
        2. Simplified explanations of any complex concepts
        3. Important things to remember
        4. How this information might be used in an assignment`;
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
          'college': 'a college sophomore',
          'kindergarten': 'a kindergartener',
        };
        prompt = `Rewrite this as if you're ${levelPersonas[level] || 'an 8th grader'} talking about what you learned in class:
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

    // Check if GEMINI_API_KEY is available
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      throw new Error('API key for Gemini is not configured');
    }

    // Updated API endpoint to use the gemini-2.0-flash-lite model
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Gemini response structure:', Object.keys(data));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure:', JSON.stringify(data));
      throw new Error('Invalid response from Gemini API');
    }

    return new Response(
      JSON.stringify({ result: data.candidates[0].content.parts[0].text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in gemini-processor function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "There was a problem processing your request with the AI service."
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
