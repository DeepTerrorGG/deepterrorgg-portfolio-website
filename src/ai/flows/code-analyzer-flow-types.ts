
'use client';

/**
 * @fileoverview Type definitions for the code analyzer flow.
 *
 * This file defines and exports the data structures (types and Zod schemas)
 * used by the code analyzer flow.
 *
 * It exports the following:
 * - CodeTask: The type for the supported analysis tasks.
 * - CodeAnalysisInput: The type for the flow's input.
 */

import { z } from 'zod';

// Define the valid tasks the AI can perform.
export const CodeTask = z.enum(['explain', 'refactor', 'comment']);
export type CodeTask = z.infer<typeof CodeTask>;

export const CodeLanguageSchema = z.enum(['Auto-detect', 'JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'HTML', 'CSS']);
export type CodeLanguage = z.infer<typeof CodeLanguageSchema>;

// Define the input schema for the flow.
export const CodeAnalysisInputSchema = z.object({
  task: CodeTask,
  code: z.string(),
  language: CodeLanguageSchema,
});
export type CodeAnalysisInput = z.infer<typeof CodeAnalysisInputSchema>;
