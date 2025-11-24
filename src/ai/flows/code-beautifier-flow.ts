
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CodeBeautifierInputSchema = z.object({
  code: z.string().describe('The raw code snippet to beautify.'),
});

export type CodeBeautifierInput = z.infer<typeof CodeBeautifierInputSchema>;

const CodeBeautifierOutputSchema = z.object({
  code: z.string().describe('The raw code snippet, passed through.'),
});

export type CodeBeautifierOutput = z.infer<typeof CodeBeautifierOutputSchema>;

/**
 * A simple flow that currently just passes the code through.
 * The complex HTML generation has been moved to the API route
 * to ensure compatibility with the image rendering service.
 */
export async function beautifyCode(
  input: CodeBeautifierInput
): Promise<CodeBeautifierOutput> {
  // For now, we just pass the code directly.
  // The API route will handle the styling.
  return { code: input.code };
}
