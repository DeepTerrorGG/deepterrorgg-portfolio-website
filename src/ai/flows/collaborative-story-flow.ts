
'use server';

import { ai } from '@/ai/genkit';
import { type StoryState } from './collaborative-story-flow-types';
import { type Message } from 'genkit';

const genrePrompts: Record<StoryState['genre'], string> = {
  'Fantasy': 'You are a master fantasy storyteller, weaving tales of magic, dragons, and epic quests.',
  'Sci-Fi': 'You are a science fiction author, exploring futuristic worlds, advanced technology, and the human condition in space.',
  'Mystery': 'You are a seasoned detective novelist, crafting intricate plots, red herrings, and suspenseful cliffhangers.',
  'Horror': 'You are a horror writer, building atmospheric dread and delivering chilling twists.',
  'Adventure': 'You are a globetrotting adventurer, narrating thrilling tales of exploration and discovery.',
  'Romance': 'You are a romance author, writing stories filled with passion, tension, and heartfelt emotion.',
};

/**
 * Continues a story based on the provided history and genre.
 * @param state The current state of the story, including genre and history.
 * @returns The AI's next part of the story as a string.
 */
export async function continueStory(state: StoryState): Promise<string> {
  const { genre, history } = state;
  const systemPrompt = genrePrompts[genre];

  if (!history || history.length === 0) {
    return 'Please start the story.';
  }

  // Convert our story format to the format Genkit expects.
  const modelHistory: Message[] = history.map(msg => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));

  try {
    const response = await ai.generate({
      prompt: "Continue the story. Write the next paragraph.",
      history: modelHistory,
      model: 'googleai/gemini-pro',
      system: systemPrompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 250,
      },
    });
    
    return response.text;

  } catch (error: any) {
    console.error('Error continuing story:', error);
    return `Sorry, an error occurred: ${error.message}`;
  }
}
