
'use client';

/**
 * @fileoverview Type definitions for the chat flow.
 *
 * This file defines and exports the data structures (types and Zod schemas)
 * used by the chat flow. It is separate from the server action file to
 * allow these types to be used in client components without bundling
 * server-side code.
 *
 * It exports the following:
 * - ChatHistory: The type definition for the conversation history.
 * - ChatPersonality: The type for the supported AI personalities.
 */

import { z } from 'zod';

/**
 * The type definition for the conversation history.
 *
 * The history is an array of messages, where each message has a role (user or
 * model) and an array of parts (the content of the message).
 */
export const ChatHistory = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  })
);
export type ChatHistory = z.infer<typeof ChatHistory>;

export const ChatPersonalitySchema = z.enum([
    'Default', 'Helpful Assistant', 'Snarky', 'Pirate', 'Poet', 'Shakespearean', 'Tech Bro', 'Philosopher', 'Flirty'
]);
export type ChatPersonality = z.infer<typeof ChatPersonalitySchema>;
