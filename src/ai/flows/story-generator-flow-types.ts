
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
 * - Story, StoryPrompt: The type definitions for the story and story prompt.
 */

import { z } from 'zod';

/** The type definition for the story prompt. */
export const StoryPrompt = z.object({
  character: z.string(),
  setting: z.string(),
});
export type StoryPrompt = z.infer<typeof StoryPrompt>;

/** The type definition for the story. */
export const Story = z.object({
  title: z.string(),
  story: z.string(),
});
export type Story = z.infer<typeof Story>;
