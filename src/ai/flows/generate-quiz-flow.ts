
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { type QuizOptions, type Quiz, QuizSchema } from './generate-quiz-flow-types';

/**
 * Generates a quiz based on the provided options.
 *
 * @param {QuizOptions} options - The configuration for the quiz.
 * @returns {Promise<Quiz | null>} A promise that resolves to an array of quiz questions or null.
 */
export async function generateQuiz(options: QuizOptions): Promise<Quiz | null> {
  let prompt = `Generate a ${options.numQuestions}-question quiz about "${options.topic}".
The difficulty should be ${options.difficulty}.
The question type should be ${options.type}.

Return the quiz as a valid JSON object. The object must contain a single key, "quiz", which is an array of question objects. Each question object must have three properties:
1. "question": A string containing the question.
2. "options": An array of strings representing the possible answers. For True/False, this array should be ["True", "False"].
3. "answer": A string containing the correct answer, which must be one of the values from the "options" array.
`;

  if (options.type === 'Fun Facts') {
      prompt += `For the 'Fun Facts' type, the question should be a statement, and the options should be True/False, asking if the statement is a fact.`
  }

  // Define the expected output schema as an object containing the quiz array.
  const QuizOutputSchema = z.object({
    quiz: QuizSchema,
  });

  const { output } = await ai.generate({
    prompt,
    model: 'googleai/gemini-2.0-flash',
    output: {
      format: 'json',
      schema: QuizOutputSchema,
    },
  });

  const quizResponse = output?.structured;
  
  if (!quizResponse || !quizResponse.quiz) {
    console.error("Failed to generate or parse quiz from AI response.");
    return null;
  }
  
  // Basic validation to ensure the response is in the correct format
  if (Array.isArray(quizResponse.quiz) && quizResponse.quiz.every(q => 'question' in q && 'options' in q && 'answer' in q)) {
    return quizResponse.quiz as Quiz;
  }

  console.error("AI response was not in the expected quiz format:", quizResponse);
  return null;
}
