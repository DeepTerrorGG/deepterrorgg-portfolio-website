
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
 * - ChatMessage: The Zod schema and type for a single message.
 * - ChatHistory: The type definition for the conversation history.
 * - ChatSession: The Zod schema and type for a full chat session.
 * - ChatPersonality: The type for the supported AI personalities.
 */

import { z } from 'zod';

/**
 * The Zod schema for a single chat message.
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * The type definition for the conversation history.
 *
 * The history is an array of messages, where each message has a role (user or model)
 * and the content as a string.
 */
export const ChatHistory = z.array(
  z.object({ // Simplified for direct use with the Genkit model
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  }),
);
export type ChatHistory = z.infer<typeof ChatHistory>;

export const ChatPersonalitySchema = z.enum([
    'Default', 'Helpful Assistant', 'Snarky', 'Pirate', 'Poet', 'Shakespearean', 'Tech Bro', 'Philosopher', 'Flirty'
]);
export type ChatPersonality = z.infer<typeof ChatPersonalitySchema>;

/**
 * The Zod schema for a full chat session, including its metadata and messages.
 * This is what will be stored in Firestore.
 */
export const ChatSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(ChatMessageSchema),
  personality: ChatPersonalitySchema,
  createdAt: z.any(), // Firestore a sent in as a server timestamp
});
export type ChatSession = z.infer<typeof ChatSessionSchema>;
