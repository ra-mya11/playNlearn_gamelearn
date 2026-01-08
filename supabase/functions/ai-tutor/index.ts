import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TutorRequest {
  type: 'explain' | 'hint' | 'encourage' | 'simplify' | 'example';
  subject: string;
  topic: string;
  question?: string;
  student_level?: number;
  context?: string;
}

const systemPrompts: Record<string, string> = {
  explain: `You are a friendly and patient AI tutor for rural Indian students (grades 6-12). 
Your role is to explain concepts in simple, clear language using relatable examples from village life.
- Use everyday examples (farming, nature, local markets, household activities)
- Avoid jargon; explain any technical terms you must use
- Be encouraging and supportive
- Keep explanations concise but thorough
- Use analogies that rural students can relate to`,

  hint: `You are a helpful AI tutor providing hints without giving away answers.
- Give progressive hints that guide thinking
- Use questions to lead students toward the answer
- Relate hints to concepts they already know
- Be encouraging and celebrate progress
- Keep hints short and focused`,

  encourage: `You are a supportive AI tutor who motivates struggling students.
- Acknowledge their effort and progress
- Remind them that learning takes time
- Share that mistakes are part of learning
- Suggest specific, actionable next steps
- Be warm, friendly, and genuine`,

  simplify: `You are an AI tutor who breaks down complex concepts.
- Use the simplest words possible
- Break into small, digestible steps
- Use visual descriptions and analogies
- Check understanding at each step
- Relate to things in their daily life`,

  example: `You are an AI tutor providing practical examples.
- Give real-world examples from rural Indian life
- Show step-by-step problem solving
- Connect theory to practical applications
- Use farming, nature, local businesses as contexts
- Make examples engaging and memorable`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { type, subject, topic, question, student_level, context }: TutorRequest = await req.json();

    console.log(`AI Tutor request: ${type} for ${subject}/${topic}`);

    if (!type || !subject || !topic) {
      return new Response(
        JSON.stringify({ error: 'type, subject, and topic are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = systemPrompts[type] || systemPrompts.explain;
    
    let userPrompt = `Subject: ${subject}\nTopic: ${topic}`;
    if (question) userPrompt += `\nStudent's question: ${question}`;
    if (student_level) userPrompt += `\nStudent level: Grade ${student_level}`;
    if (context) userPrompt += `\nAdditional context: ${context}`;

    userPrompt += `\n\nPlease provide a ${type === 'hint' ? 'helpful hint' : type === 'encourage' ? 'encouraging message' : type === 'simplify' ? 'simplified explanation' : type === 'example' ? 'practical example' : 'clear explanation'} for this topic.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log(`AI Tutor response generated successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        response: content,
        type,
        subject,
        topic
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-tutor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
