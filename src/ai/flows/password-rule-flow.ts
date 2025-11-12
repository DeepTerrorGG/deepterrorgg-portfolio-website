
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PasswordRuleOutputSchema = z.object({
  rule: z.string().describe("A new, creative, and somewhat absurd rule for a password. For example: 'Your password must include a color.' or 'Your password must contain a zodiac sign.'"),
  validationLogic: z.string().describe("A snippet of JavaScript boolean logic to validate this rule. The password will be available as a variable named 'password'. For example, for the color rule: '/(red|green|blue|yellow|black|white)/i.test(password)'"),
});
export type PasswordRuleOutput = z.infer<typeof PasswordRuleOutputSchema>;

const SYSTEM_PROMPT = `
You are a creative game designer for "The Password Game". Your task is to generate a new, single, fun, and quirky password rule.
You MUST also provide the JavaScript logic to validate the rule.

### Your Response Format
Your response MUST be a raw JSON object that conforms to the following schema, and nothing else. Do not wrap it in markdown or add any explanatory text.

### Schema
{
  "rule": "<The password rule text>",
  "validationLogic": "<The JavaScript validation logic as a string>"
}

### Example 1
{
  "rule": "Your password must include a day of the week.",
  "validationLogic": "/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(password)"
}

### Example 2
{
  "rule": "Your password must include a Roman numeral.",
  "validationLogic": "/\\b(I|V|X|L|C|D|M)+\\b/i.test(password)"
}
`;


export async function generatePasswordRule(existingRules: string[]): Promise<PasswordRuleOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    output: {
        schema: PasswordRuleOutputSchema,
        format: 'json',
    },
    system: SYSTEM_PROMPT,
    prompt: `
    Generate a new rule. Do not generate a duplicate of any of the following existing rules:
    - ${existingRules.join('\n- ')}
    `,
  });

  if (!output?.structured) {
    throw new Error("Failed to generate a valid rule from the AI.");
  }
  return output.structured;
}
