
'use client';

import { z } from 'zod';

export const StoryGenreSchema = z.enum(['Fantasy', 'Sci-Fi', 'Mystery', 'Horror', 'Adventure', 'Romance']);
export type StoryGenre = z.infer<typeof StoryGenreSchema>;

export const StoryMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type StoryMessage = z.infer<typeof StoryMessageSchema>;

export const StoryStateSchema = z.object({
  genre: StoryGenreSchema,
  history: z.array(StoryMessageSchema),
});
export type StoryState = z.infer<typeof StoryStateSchema>;
