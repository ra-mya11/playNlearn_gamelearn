import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuizQuestion {
  id: number;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options?: string[];
  correct_answer: string;
  explanation: string;
  points: number;
}

export interface EvaluationResult {
  is_correct: boolean;
  score: number;
  feedback: string;
  correct_answer_explanation: string;
  improvement_tips?: string[];
}

export interface FeedbackResult {
  strengths: string[];
  areas_to_improve: string[];
  encouragement: string;
  next_steps: string[];
  study_tips?: string[];
}

export function useAIAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);

  const generateQuiz = async ({
    subject,
    topic,
    difficulty = 2,
    numQuestions = 5
  }: {
    subject: string;
    topic: string;
    difficulty?: number;
    numQuestions?: number;
  }): Promise<QuizQuestion[] | null> => {
    setIsLoading(true);
    setQuiz(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assessment", {
        body: {
          type: 'generate_quiz',
          subject,
          topic,
          difficulty,
          num_questions: numQuestions
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const questions = data.result?.questions || [];
      setQuiz(questions);
      return questions;

    } catch (error) {
      console.error("Quiz generation error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate quiz";
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateAnswer = async ({
    subject,
    topic,
    question,
    studentAnswer,
    correctAnswer
  }: {
    subject: string;
    topic: string;
    question: string;
    studentAnswer: string;
    correctAnswer?: string;
  }): Promise<EvaluationResult | null> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assessment", {
        body: {
          type: 'evaluate_answer',
          subject,
          topic,
          question,
          student_answer: studentAnswer,
          correct_answer: correctAnswer
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      return data.result as EvaluationResult;

    } catch (error) {
      console.error("Answer evaluation error:", error);
      const message = error instanceof Error ? error.message : "Failed to evaluate answer";
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const provideFeedback = async ({
    subject,
    topic,
    question,
    studentAnswer,
    correctAnswer
  }: {
    subject: string;
    topic: string;
    question: string;
    studentAnswer: string;
    correctAnswer?: string;
  }): Promise<FeedbackResult | null> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assessment", {
        body: {
          type: 'provide_feedback',
          subject,
          topic,
          question,
          student_answer: studentAnswer,
          correct_answer: correctAnswer
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      return data.result as FeedbackResult;

    } catch (error) {
      console.error("Feedback error:", error);
      const message = error instanceof Error ? error.message : "Failed to get feedback";
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    quiz,
    generateQuiz,
    evaluateAnswer,
    provideFeedback,
  };
}
