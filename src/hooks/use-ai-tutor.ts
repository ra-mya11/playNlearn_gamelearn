import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TutorRequestType = 'explain' | 'hint' | 'encourage' | 'simplify' | 'example';

export interface TutorResponse {
  success: boolean;
  response: string;
  type: TutorRequestType;
  subject: string;
  topic: string;
}

export function useAITutor() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const askTutor = async ({
    type,
    subject,
    topic,
    question,
    studentLevel,
    context
  }: {
    type: TutorRequestType;
    subject: string;
    topic: string;
    question?: string;
    studentLevel?: number;
    context?: string;
  }): Promise<TutorResponse | null> => {
    setIsLoading(true);
    setResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-tutor", {
        body: {
          type,
          subject,
          topic,
          question,
          student_level: studentLevel,
          context
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data.response);
      return data as TutorResponse;

    } catch (error) {
      console.error("AI Tutor error:", error);
      const message = error instanceof Error ? error.message : "Failed to get AI response";
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getExplanation = (subject: string, topic: string, question?: string) => 
    askTutor({ type: 'explain', subject, topic, question });

  const getHint = (subject: string, topic: string, question: string) => 
    askTutor({ type: 'hint', subject, topic, question });

  const getEncouragement = (subject: string, topic: string, context?: string) => 
    askTutor({ type: 'encourage', subject, topic, context });

  const getSimplifiedExplanation = (subject: string, topic: string, question?: string) => 
    askTutor({ type: 'simplify', subject, topic, question });

  const getExample = (subject: string, topic: string, question?: string) => 
    askTutor({ type: 'example', subject, topic, question });

  return {
    isLoading,
    response,
    askTutor,
    getExplanation,
    getHint,
    getEncouragement,
    getSimplifiedExplanation,
    getExample,
  };
}
