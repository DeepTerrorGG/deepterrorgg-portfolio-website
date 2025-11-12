
'use server';

/**
 * @fileoverview A chatbot that can remember the history of the conversation.
 *
 * This file defines a Genkit flow that takes a user's message and a history of
 * the conversation as input, and returns a response from the AI model.
 *
 * It exports the following functions:
 * - chat: The main function that handles the chatbot logic.
 */

import { ai } from '@/ai/genkit';
import { type ChatHistory } from './chat-flow-types';

/**
 * The main function that handles the chatbot logic.
 *
 * @param history The history of the conversation.
 * @param message The user's new message.
 * @returns The AI's response.
 */
export async function chat(history: ChatHistory, message: string) {
  // Add a new message to the history.
  history.push({ role: 'user', parts: [{ text: message }] });

  // Use the user's new message as the prompt and provide the past conversation as history.
  const { output } = await ai.generate({
    prompt: message,
    history: history,
    model: 'googleai/gemini-pro'
  });

  const response = output?.text;

  // Add the AI's response to the history.
  if (response) {
    history.push({ role: 'model', parts: [{ text: response }] });
  }

  // Return the AI's response.
  return response;
}
