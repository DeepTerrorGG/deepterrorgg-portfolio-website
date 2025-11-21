
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RuleGenerationInputSchema = z.array(z.string());

const RuleGenerationOutputSchema = z.object({
  rule: z.string().describe("A creative, specific, and verifiable password rule. The rule should be a single sentence and not be a generic 'must contain' rule. It must be something that can be programmatically checked."),
});

const RuleValidationInputSchema = z.object({
    password: z.string(),
    rule: z.string(),
});

const RuleValidationOutputSchema = z.object({
    isValid: z.boolean().describe("Whether the password successfully meets the rule's criteria."),
});

const HintGenerationOutputSchema = z.object({
  hint: z.string().describe("A helpful but not too obvious hint to guide the user to solve the password rule."),
});


export async function generatePasswordRule(existingRules: string[]): Promise<{ rule: string } | null> {
  const systemPrompt = `You are an AI for a password game. Your job is to invent a new, creative, and programmatically verifiable password rule that is NOT in the list of existing rules.

Existing rules (do not repeat these):
${existingRules.join('\n- ')}

Good examples of creative rules:
- Your password must include a chemical element symbol (e.g., Fe, Au).
- The Roman numerals in your password must sum to 50.
- Your password must contain the name of a US state capital.
- Your password must start with a letter from the first half of the alphabet and end with one from the second half.
- Any numbers in your password must be in ascending order.
- Your password must include the name of a figure from Greek mythology.
- Your password must contain a food that is a fruit.
- Your password must contain a type of geometric shape.
- Your password must include a sound an animal makes.
- Your password must include the name of a musical instrument.

Bad examples (too generic or simple):
- Your password must be long.
- Your password must have a special character.
- Your password must have a capital letter.

Generate one new, unique rule.
`;
  try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: systemPrompt,
        output: {
          format: 'json',
          schema: RuleGenerationOutputSchema,
        },
        config: {
          temperature: 0.9, // Higher temperature for more creativity
        }
      });

      if (!output?.structured) {
        console.error("AI failed to return structured data for rule generation.");
        // Fallback or retry logic could go here
        return null;
      }
      return output.structured;

  } catch (error) {
      console.error("Error in generatePasswordRule:", error);
      return null;
  }
}

export async function validatePasswordRule(password: string, rule: string): Promise<boolean> {
    const prompt = `Given the password and the rule, determine if the password strictly follows the rule.
Respond with only true or false in the JSON output.

Password: "${password}"
Rule: "${rule}"
`;

    try {
        const { output } = await ai.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt: prompt,
            output: {
                format: 'json',
                schema: RuleValidationOutputSchema,
            },
             config: {
                temperature: 0, // Zero temperature for deterministic validation
            }
        });

        return output?.structured?.isValid ?? false;

    } catch (error) {
        console.error("Error in validatePasswordRule:", error);
        return false;
    }
}


export async function getPasswordHint(rule: string): Promise<string> {
    const prompt = `The user is playing a password game and is stuck on the following rule. Provide a short, clever hint that helps them without giving away the answer directly.

Rule: "${rule}"
`;
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: prompt,
        output: {
          format: 'json',
          schema: HintGenerationOutputSchema,
        },
         config: {
            temperature: 0.7,
        }
      });
      return output?.structured?.hint ?? "Try thinking outside the box!";
    } catch (error) {
      console.error("Error in getPasswordHint:", error);
      throw new Error("Failed to get hint from AI.");
    }
}
