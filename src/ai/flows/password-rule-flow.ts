
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PasswordRuleOutputSchema = z.object({
  rule: z.string().describe("A new, creative, and somewhat absurd rule for a password. For example: 'Your password must include a color.' or 'Your password must contain a zodiac sign.'"),
  validationLogic: z.string().describe("A snippet of JavaScript boolean logic to validate this rule. The password will be available as a variable named 'password'. For example, for the color rule: '/(red|green|blue|yellow|black|white)/i.test(password)'"),
});
export type PasswordRuleOutput = z.infer<typeof PasswordRuleOutputSchema>;

export async function generatePasswordRule(existingRules: string[]): Promise<PasswordRuleOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    output: {
        schema: PasswordRuleOutputSchema,
        format: 'json',
    },
    prompt: `You are a creative game designer creating rules for "The Password Game".
    Generate a new, single rule for a user's password.
    The rule should be fun, quirky, or slightly challenging, but not impossible.
    You must also provide the JavaScript logic to validate the rule.
    
    Here are the rules that already exist, so don't generate a duplicate:
    - ${existingRules.join('\n- ')}
    
    Examples of good rules:
    - Rule: "Your password must include a day of the week."
      Validation: "/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(password)"
    - Rule: "Your password must include a Roman numeral."
      Validation: "/\\b(I|V|X|L|C|D|M)+\\b/i.test(password)"
    - Rule: "Your password must include the name of a planet."
      Validation: "/(Mercury|Venus|Earth|Mars|Jupiter|Saturn|Uranus|Neptune)/i.test(password)"
    
    Now, generate a new one.
    `,
  });

  if (!output?.structured) {
    throw new Error("Failed to generate a valid rule from the AI.");
  }
  return output.structured;
}
