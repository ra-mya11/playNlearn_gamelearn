import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentRequest {
  type: 'generate_quiz' | 'evaluate_answer' | 'provide_feedback';
  subject: string;
  topic: string;
  difficulty?: number;
  num_questions?: number;
  question?: string;
  student_answer?: string;
  correct_answer?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { 
      type, 
      subject, 
      topic, 
      difficulty = 1, 
      num_questions = 5,
      question,
      student_answer,
      correct_answer 
    }: AssessmentRequest = await req.json();

    console.log(`AI Assessment request: ${type} for ${subject}/${topic}`);

    if (!type || !subject || !topic) {
      return new Response(
        JSON.stringify({ error: 'type, subject, and topic are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';
    let tools: any[] = [];
    let toolChoice: any = undefined;

    if (type === 'generate_quiz') {
      systemPrompt = `You are an educational assessment AI creating quizzes for rural Indian students.
Create engaging, fair questions appropriate for the difficulty level.
Use relatable examples from village life, farming, nature, and local contexts.
Mix question types: multiple choice, true/false, and short answer.`;

      userPrompt = `Create a ${num_questions}-question quiz about "${topic}" in ${subject}.
Difficulty level: ${difficulty}/5 (1=easy, 5=hard)
Target audience: Rural Indian students`;

      tools = [{
        type: "function",
        function: {
          name: "generate_quiz",
          description: "Generate a quiz with multiple questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    question: { type: "string" },
                    type: { type: "string", enum: ["multiple_choice", "true_false", "short_answer"] },
                    options: { 
                      type: "array", 
                      items: { type: "string" },
                      description: "Options for multiple choice questions"
                    },
                    correct_answer: { type: "string" },
                    explanation: { type: "string" },
                    points: { type: "number" }
                  },
                  required: ["id", "question", "type", "correct_answer", "explanation", "points"]
                }
              }
            },
            required: ["questions"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "generate_quiz" } };

    } else if (type === 'evaluate_answer') {
      systemPrompt = `You are an educational assessment AI evaluating student answers.
Be fair and constructive in your evaluation.
Give partial credit where appropriate.
Explain why answers are correct or incorrect.`;

      userPrompt = `Evaluate this student answer:
Question: ${question}
Student's Answer: ${student_answer}
${correct_answer ? `Correct Answer: ${correct_answer}` : ''}
Subject: ${subject}, Topic: ${topic}`;

      tools = [{
        type: "function",
        function: {
          name: "evaluate_answer",
          description: "Evaluate a student's answer",
          parameters: {
            type: "object",
            properties: {
              is_correct: { type: "boolean" },
              score: { type: "number", description: "Score from 0 to 100" },
              feedback: { type: "string" },
              correct_answer_explanation: { type: "string" },
              improvement_tips: { type: "array", items: { type: "string" } }
            },
            required: ["is_correct", "score", "feedback", "correct_answer_explanation"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "evaluate_answer" } };

    } else if (type === 'provide_feedback') {
      systemPrompt = `You are an encouraging educational AI providing feedback to rural Indian students.
Be supportive and constructive.
Highlight what they did well.
Give specific, actionable suggestions for improvement.`;

      userPrompt = `Provide encouraging feedback for this student:
Subject: ${subject}, Topic: ${topic}
Question: ${question}
Their Answer: ${student_answer}
${correct_answer ? `Expected Answer: ${correct_answer}` : ''}`;

      tools = [{
        type: "function",
        function: {
          name: "provide_feedback",
          description: "Provide constructive feedback",
          parameters: {
            type: "object",
            properties: {
              strengths: { type: "array", items: { type: "string" } },
              areas_to_improve: { type: "array", items: { type: "string" } },
              encouragement: { type: "string" },
              next_steps: { type: "array", items: { type: "string" } },
              study_tips: { type: "array", items: { type: "string" } }
            },
            required: ["strengths", "areas_to_improve", "encouragement", "next_steps"]
          }
        }
      }];
      toolChoice = { type: "function", function: { name: "provide_feedback" } };
    }

    const requestBody: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    };

    if (tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = toolChoice;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
    
    // Extract tool call result
    let result: any = null;
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        result = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool call arguments:", e);
        result = { raw: toolCall.function.arguments };
      }
    } else {
      result = { message: data.choices?.[0]?.message?.content };
    }

    console.log(`AI Assessment response generated successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        type,
        subject,
        topic,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-assessment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
