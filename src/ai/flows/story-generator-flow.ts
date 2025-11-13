
'use server';

/**
 * @fileoverview A story generator that creates stories from a prompt.
 *
 * This file defines a Genkit flow that takes a prompt as input and returns a
 * story.
 *
 * It exports the following functions:
 * - generateStory: The main function that handles the story generation.
 */

import { ai } from '@/ai/genkit';
import { type StoryPrompt, type Story, StorySchema } from './story-generator-flow-types';

/**
 * The main function that handles the story generation.
 *
 * @param prompt The prompt for the story.
 * @returns The generated story.
 */
export async function generateStory(prompt: StoryPrompt): Promise<Story | null> {
  
  let systemPrompt = `You are a creative writing assistant. You will be given a set of parameters and must write a creative and engaging story based on them.
The story must have a clear beginning, middle, and end. It should be well-structured with a compelling title.
Ensure the tone of the story matches the specified genre and style.
You must respond with ONLY a valid JSON object string. Do not include any other text or markdown formatting.
The JSON object must have two fields: "title" (a string) and "story" (a string).`;
  
  let userPrompt = `Generate a story with the following details:\n
Character: ${prompt.character}
Setting: ${prompt.setting}
`;

  if (prompt.genre && prompt.genre !== 'Any') {
    userPrompt += `Genre: ${prompt.genre}\n`;
  }
  if (prompt.style && prompt.style !== 'Default') {
    userPrompt += `Literary Style: ${prompt.style}\n`;
  }
  if (prompt.twist && prompt.twist !== 'None') {
    userPrompt += `Incorporate the following plot twist: ${prompt.twist}\n`;
  }

  const { text } = await ai.generate({
    prompt: userPrompt,
    system: systemPrompt,
    model: 'googleai/gemini-2.0-flash',
  });

  try {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    
    let jsonString = text;
    if (match) {
      jsonString = match[1];
    }

    const parsed = JSON.parse(jsonString);
    const validated = StorySchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    } else {
      console.error("AI returned invalid story format:", validated.error);
      return null;
    }
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", error);
    return null;
  }
}
