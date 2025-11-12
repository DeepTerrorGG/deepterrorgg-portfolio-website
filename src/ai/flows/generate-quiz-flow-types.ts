
'use client';

import { z } from 'zod';

// Schemas and Types
export const QuizDifficultySchema = z.enum(["Easy", "Medium", "Hard"]);
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>;

export const QuizTypeSchema = z.enum(["Multiple Choice", "True/False", "Fun Facts"]);
export type QuizType = z.infer<typeof QuizTypeSchema>;

export const QuizOptionsSchema = z.object({
  topic: z.string().describe("The subject of the quiz"),
  numQuestions: z.number().min(3).max(10).describe("The number of questions to generate"),
  difficulty: QuizDifficultySchema,
  type: QuizTypeSchema,
});
export type QuizOptions = z.infer<typeof QuizOptionsSchema>;

export const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizSchema = z.array(QuizQuestionSchema);
export type Quiz = z.infer<typeof QuizSchema>;
