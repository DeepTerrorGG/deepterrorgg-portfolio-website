'use server';
/**
 * @fileOverview A simple Genkit flow for a conversational chatbot.
 *
 * - chat - A function that takes conversation history and a new message, and returns a response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  message: z.string().describe('The user\'s latest message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The model's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { history, message } = input;

    // Correctly combine the history with the new user message.
    const fullHistory = [
      ...history,
      { role: 'user' as const, content: message },
    ];

    const { output } = await ai.generate({
      // The entire conversation goes into the history parameter.
      history: fullHistory,
      config: {
        // Lower temperature for more predictable, less "creative" responses
        temperature: 0.5,
      },
    });

    return { response: output?.text ?? 'Sorry, I could not generate a response.' };
  }
);
