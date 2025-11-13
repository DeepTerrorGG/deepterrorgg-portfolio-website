
'use server';

/**
 * @fileoverview An AI flow for analyzing and manipulating code.
 *
 * This file defines a Genkit flow that can explain, refactor, or add comments
 * to a given code snippet.
 *
 * It exports the following:
 * - analyzeCode: The main function that handles the code analysis.
 */

import { ai } from '@/ai/genkit';
import { 
  type CodeAnalysisInput,
} from './code-analyzer-flow-types';


const taskPrompts: Record<CodeAnalysisInput['task'], string> = {
  explain: `
    You are an expert software engineer acting as a code reviewer.
    Explain the following code snippet clearly and concisely.
    Focus on the code's purpose, its logic, and any potential implications or improvements.
    Format your response using Markdown, including code blocks for examples where appropriate.
    `,
  refactor: `
    You are an expert software engineer specializing in writing clean, efficient, and maintainable code.
    Refactor the following code snippet.
    Your goal is to improve its readability, performance, and adherence to best practices without altering its functionality.
    Provide the refactored code in a Markdown code block.
    After the code block, briefly explain the key changes you made and why they are improvements.
    `,
  comment: `
    You are an expert software engineer who writes excellent, clear documentation.
    Add insightful and helpful comments to the following code snippet.
    The comments should clarify the purpose of functions, the logic of complex sections, and the roles of important variables.
    Do NOT explain the code outside of the comments themselves.
    Return only the fully commented code block. Do not add any extra explanations or markdown formatting.
    `,
  debug: `
    You are an expert debugger.
    Analyze the following code snippet to identify potential bugs, logical errors, or anti-patterns.
    Provide a fixed version of the code in a Markdown code block.
    After the code block, provide a step-by-step explanation of the bugs you found and how your fixes address them.
    If no bugs are found, state that and explain why the code is correct.
    `,
  optimize: `
    You are an expert in code performance and optimization.
    Analyze the following code for performance bottlenecks.
    Provide a more optimized version of the code in a Markdown code block.
    After the code block, explain the optimizations you made and why they improve performance (e.g., reduced time complexity, lower memory usage).
    `,
  test: `
    You are an expert in software testing and quality assurance.
    Write a suite of unit tests for the following code snippet.
    Use a popular testing framework appropriate for the language (e.g., Jest for JavaScript/TypeScript, Pytest for Python, JUnit for Java).
    Provide the complete test code in a Markdown code block.
    If the language is not obvious, use a generic, easy-to-understand test structure.
    `,
};


/**
 * The main function that handles the code analysis logic.
 *
 * @param input The code and the task to perform.
 * @returns The AI's response as a string.
 */
export async function analyzeCode(input: CodeAnalysisInput) {
    const { task, code, language } = input;

    let systemPrompt = taskPrompts[task];

    if (language && language !== 'Auto-detect') {
        systemPrompt += `\nThe code is written in ${language}.`;
    }

    const finalPrompt = `Here is the code:
\'\'\'
${code}
\'\'\'
`;

  const { text } = await ai.generate({
      prompt: finalPrompt,
      system: systemPrompt,
      model: 'googleai/gemini-2.0-flash',
      config: {
          temperature: 0.3, // Lower temperature for more deterministic code-related tasks
      }
  });

  return text;
}
