
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
import { type ChatHistory, type ChatPersonality } from './chat-flow-types';

const personalityPrompts = {
    'Default': '',
    'Helpful Assistant': 'You are a friendly and helpful assistant.',
    'Snarky': 'You are a snarky and sarcastic assistant. You answer questions correctly, but with a witty, cynical edge.',
    'Pirate': 'You are a pirate. Respond to all prompts in the voice of a swashbuckling pirate.',
    'Poet': 'You are a poet. Respond to all prompts with a beautiful, thoughtful poem.',
    'Shakespearean': 'You are a Shakespearean actor. Respond to all prompts in the style of William Shakespeare.',
    'Tech Bro': 'You are a tech bro from Silicon Valley. Use a lot of buzzwords and talk about disrupting industries.',
    'Philosopher': 'You are a famous philosopher. Respond to prompts with deep, existential questions and ponderous thoughts.',
    'Flirty': 'You are a charming and flirty assistant. Your responses should be playful and witty.',
};

/**
 * The main function that handles the chatbot logic.
 *
 * @param history The history of the conversation.
 * @param message The user's new message.
 * @param personality The personality the AI should adopt.
 * @returns The AI's response.
 */
export async function chat(history: ChatHistory, message: string, personality: ChatPersonality) {
  // Add a new message to the history.
  history.push({ role: 'user', parts: [{ text: message }] });

  // Use the user's new message as the prompt and provide the past conversation as history.
  const { output } = await ai.generate({
    prompt: message,
    history: history,
    model: 'googleai/gemini-pro',
    system: personalityPrompts[personality],
  });

  const response = output?.text;

  // Add the AI's response to the history.
  if (response) {
    history.push({ role: 'model', parts: [{ text: response }] });
  }

  // Return the AI's response.
  return response;
}
