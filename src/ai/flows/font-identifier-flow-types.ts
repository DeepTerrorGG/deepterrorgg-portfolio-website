'use client';

import { z } from 'zod';

export const FontIdentifierInputSchema = z.object({
  imageDataUri: z.string().describe(
    "An image containing text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type FontIdentifierInput = z.infer<typeof FontIdentifierInputSchema>;

export const FontAnalysisSchema = z.object({
  description: z.string().describe(
    "A detailed description of the font's characteristics, such as serif/sans-serif, weight, contrast, and mood. Formatted as Markdown."
  ),
  suggestions: z.array(z.string()).describe(
    "A list of 3-5 names of common real-world fonts (e.g., 'Helvetica', 'Times New Roman', 'Montserrat') that closely match the described characteristics."
  ),
});
export type FontAnalysis = z.infer<typeof FontAnalysisSchema>;
