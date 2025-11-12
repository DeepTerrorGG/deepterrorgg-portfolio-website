
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
    'Philosopher': 'You are a famous philosopher. Respond to all prompts with deep, existential questions and ponderous thoughts.',
    'Flirty': 'You are a charming and flirty assistant. Your responses should be playful and witty.',
};

/**
 * The main function that handles the chatbot logic.
 *
 * @param history The full conversation history.
 * @param personality The personality the AI should adopt.
 * @returns The AI's response as a string.
 */
export async function chat(history: ChatHistory, personality: ChatPersonality): Promise<string> {
  const systemPrompt = personalityPrompts[personality] || '';

  if (!history || history.length === 0) {
    return "Sorry, I didn't receive a message.";
  }
  
  const latestMessage = history[history.length - 1];
  const precedingHistory = history.slice(0, -1);

  if (!latestMessage) {
    return "Sorry, I couldn't process your message.";
  }

  try {
    const { output } = await ai.generate({
      prompt: latestMessage.parts[0].text,
      history: precedingHistory.length > 0 ? precedingHistory : undefined,
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
        ]
      }
    });

    const response = output?.text;
    
    if (response) {
      return response;
    }

    // Handle cases where the response is empty (e.g., safety-blocked)
    return "I'm sorry, I couldn't formulate a response for that. Please try a different topic.";

  } catch (error: any) {
    console.error("Error generating AI response:", error);
    
    // Provide more specific error feedback
    let errorMessage = "Sorry, an unexpected error occurred while generating a response.";
    if (error.message) {
        if (error.message.includes('API key not valid')) {
            errorMessage = "AI configuration error: The API key is not valid. Please check your environment variables.";
        } else if (error.message.includes('429')) {
            errorMessage = "AI Service Overloaded: The service is currently experiencing high traffic. Please try again in a moment.";
        } else if (error.message.includes('Not Found')) {
            errorMessage = `AI Model Not Found: The model 'googleai/gemini-2.0-flash' is not available.`;
        }
        else {
            errorMessage = `An error occurred: ${error.message}`;
        }
    }
    return errorMessage;
  }
}
