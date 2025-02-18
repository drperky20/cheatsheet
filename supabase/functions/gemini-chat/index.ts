
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const question = formData.get('question')
    const file = formData.get('file')

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found')
    }

    let prompt = question as string
    let mimeType = ''

    if (file) {
      const fileBlob = file as Blob
      mimeType = fileBlob.type
      
      // Convert file to base64
      const fileBytes = await fileBlob.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBytes)))
      
      // Store file in Supabase Storage
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const fileExt = fileBlob.name.split('.').pop()
      const filePath = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, fileBlob)

      if (uploadError) {
        throw new Error('Failed to upload file')
      }

      // Add file context to prompt
      prompt = `The user has uploaded a ${mimeType} file. Here's their question about it: ${question}`
    }

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${geminiApiKey}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    const data = await response.json()
    const answer = data.candidates[0].content.parts[0].text

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
