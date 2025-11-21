'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { 
  PromptEnhancerInputSchema, 
  PromptEnhancerOutputSchema, 
  type PromptEnhancerInput,
  TextPromptDetailsSchema,
  ImagePromptDetailsSchema,
  VideoPromptDetailsSchema,
  CodePromptDetailsSchema,
} from './prompt-enhancer-flow-types';

function buildSystemPrompt(input: PromptEnhancerInput): string {
  let prompt = `You are an expert AI prompt engineer. Your task is to expand on a user's simple idea and create a detailed, structured, and effective prompt tailored for a specific type of generative AI model.

The user wants to generate a prompt for the "${input.targetModel}" model, focusing on a "${input.promptType}" output.

Base Idea: "${input.idea}"

Use the following details to enrich the prompt. Be creative and add descriptive elements where helpful.

`;

  switch (input.promptType) {
    case 'Text':
      const textDetails = input.details as z.infer<typeof TextPromptDetailsSchema>;
      prompt += `**Text Prompt Details:**
- **Persona:** ${textDetails.persona || 'Not specified. You can suggest one.'}
- **Task:** ${textDetails.task || 'Not specified. Define a clear task.'}
- **Format:** ${textDetails.format || 'Suggest a clear output format (e.g., "a JSON object", "a markdown list").'}
- **Tone:** ${textDetails.tone || 'Not specified. Suggest a tone (e.g., "formal", "witty").'}
- **Length:** ${textDetails.length || 'Not specified. Suggest a length (e.g., "one paragraph", "500 words").'}
`;
      break;
    case 'Image':
      const imgDetails = input.details as z.infer<typeof ImagePromptDetailsSchema>;
      prompt += `**Image Prompt Details:**
- **Core Subject:** Create a visually rich scene based on the user's idea.
- **Style:** ${imgDetails.style || 'Default. Choose a fitting style.'}
- **Composition:** ${imgDetails.composition || 'Not specified. Describe the camera angle and framing (e.g., "wide-angle shot", "close-up portrait").'}
- **Lighting:** ${imgDetails.lighting || 'Not specified. Describe the lighting (e.g., "cinematic lighting", "soft natural light").'}
- **Mood:** ${imgDetails.mood || 'Not specified. Describe the mood (e.g., "dramatic", "serene", "energetic").'}
- **Camera Angle:** ${imgDetails.cameraAngle || 'Not specified.'}
- **Lens Type:** ${imgDetails.lensType || 'Not specified.'}
- **Artist Inspiration:** ${imgDetails.artistInspiration || 'Not specified.'}
- **Negative Prompt:** If provided, list things to avoid: "${imgDetails.negativePrompt || 'None'}"
- **Keywords:** Include a list of 5-10 powerful, comma-separated keywords to enhance detail.
`;
      break;
    case 'Video':
        const videoDetails = input.details as z.infer<typeof VideoPromptDetailsSchema>;
        prompt += `**Video Prompt Details:**
- **Scene:** ${videoDetails.scene || 'Based on the user\'s idea. Describe the environment and action.'}
- **Shot Type:** ${videoDetails.shotType || 'Not specified. Suggest a camera shot (e.g., "drone footage", "panning shot").'}
- **Visual Style:** ${videoDetails.style || 'Not specified. Describe a visual style (e.g., "cinematic, 8k, hyperrealistic").'}
- **Camera Movement:** ${videoDetails.cameraMovement || 'Not specified.'}
- **Lighting Style:** ${videoDetails.lightingStyle || 'Not specified.'}
- **Color Grade:** ${videoDetails.colorGrade || 'Not specified.'}
- **Action/Movement:** Describe the key movements of subjects and the camera.
`;
      break;
    case 'Code':
        const codeDetails = input.details as z.infer<typeof CodePromptDetailsSchema>;
        prompt += `**Code Prompt Details:**
- **Language:** ${codeDetails.language || 'Not specified. Auto-detect or assume a common language.'}
- **Task:** ${codeDetails.task || 'Based on user\'s idea. Be very specific about what the code should do.'}
- **Dependencies:** ${codeDetails.dependencies || 'None specified.'}
- **Data Structures:** ${codeDetails.dataStructures || 'Not specified. You can suggest appropriate ones.'}
- **Error Handling:** ${codeDetails.errorHandling || 'Not specified. Assume standard error handling.'}
- **Constraints:** ${codeDetails.constraints || 'None specified. You can add logical constraints (e.g., "must not use external libraries").'}
- **Example:** Provide a clear example of the expected input and output.
`;
      break;
  }
  
  prompt += `
Generate ONLY the final, enhanced prompt as a single block of text. Do not add explanations or surrounding text. Just the prompt itself.
`;

  return prompt;
}

export async function enhancePrompt(
  input: PromptEnhancerInput
): Promise<z.infer<typeof PromptEnhancerOutputSchema>> {
  const systemPrompt = buildSystemPrompt(input);

  try {
    const { text } = await ai.generate({
      model: 'googleai/gemini-pro',
      prompt: systemPrompt,
      config: {
        temperature: 0.7,
      },
    });

    return { enhancedPrompt: text };

  } catch (error) {
    console.error('Error in enhancePrompt flow:', error);
    throw new Error('Failed to enhance prompt due to an AI service error.');
  }
}
