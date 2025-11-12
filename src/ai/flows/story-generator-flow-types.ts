
'use client';

/**
 * @fileoverview Type definitions for the story generator flow.
 *
 * This file defines and exports the data structures (types and Zod schemas)
 * used by the story generator flow. It is separate from the server action file to
 * allow these types to be used in client components without bundling
 * server-side code.
 *
 * It exports the following:
 * - StorySchema, StoryPromptSchema: The schemas for the story and story prompt.
 * - Story, StoryPrompt: The TypeScript types for the story and story prompt.
 */

import { z } from 'zod';

export const StoryGenreSchema = z.enum(['Any', 'Fantasy', 'Science Fiction', 'Mystery', 'Horror', 'Romance', 'Comedy']);
export type StoryGenre = z.infer<typeof StoryGenreSchema>;

export const StoryStyleSchema = z.enum(['Default', 'Poetic', 'Gritty', 'Humorous', 'Epistolary (told through letters)']);
export type StoryStyle = z.infer<typeof StoryStyleSchema>;

export const StoryPlotTwistSchema = z.enum(['None', 'Betrayal', 'Amnesia', 'It was all a dream', 'The hero is the villain', 'An unexpected inheritance']);
export type StoryPlotTwist = z.infer<typeof StoryPlotTwistSchema>;

/** The schema for the story prompt. */
export const StoryPromptSchema = z.object({
  character: z.string(),
  setting: z.string(),
  genre: StoryGenreSchema,
  style: StoryStyleSchema,
  twist: StoryPlotTwistSchema,
});
export type StoryPrompt = z.infer<typeof StoryPromptSchema>;

/** The schema for the story. */
export const StorySchema = z.object({
  title: z.string(),
  story: z.string(),
});
export type Story = z.infer<typeof StorySchema>;
