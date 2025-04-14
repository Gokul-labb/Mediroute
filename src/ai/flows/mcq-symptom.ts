'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating multiple-choice questions (MCQs)
 * based on user-provided symptoms to understand the symptom contextually.
 *
 * - generateMCQs - A function that takes user symptoms as input and returns a set of MCQs.
 * - GenerateMCQsInput - The input type for the generateMCQs function, including user symptoms.
 * - GenerateMCQsOutput - The return type for the generateMCQs function, providing a list of MCQs.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateMCQsInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user.'),
});
export type GenerateMCQsInput = z.infer<typeof GenerateMCQsInputSchema>;

const MCQSchema = z.object({
  question: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).describe('The options for the question.'),
});
export type MCQ = z.infer<typeof MCQSchema>;

const GenerateMCQsOutputSchema = z.object({
  mcqs: z.array(MCQSchema).describe('A list of multiple-choice questions.'),
});
export type GenerateMCQsOutput = z.infer<typeof GenerateMCQsOutputSchema>;

export async function generateMCQs(input: GenerateMCQsInput): Promise<GenerateMCQsOutput> {
  return generateMCQsFlow(input);
}

const generateMCQsPrompt = ai.definePrompt({
  name: 'generateMCQsPrompt',
  input: {
    schema: z.object({
      symptoms: z.string().describe('The symptoms described by the user.'),
    }),
  },
  output: {
    schema: z.object({
      mcqs: z.array(MCQSchema).describe('A list of multiple-choice questions.'),
    }),
  },
  prompt: `Given the following symptoms: {{{symptoms}}}, generate a list of multiple-choice questions to understand the symptoms contextually.

Each question should have a question field and an options field. The options field should contain an array of strings representing the possible answers.

Format the output as a JSON object with a "mcqs" field containing an array of questions.`,
});

const generateMCQsFlow = ai.defineFlow<
  typeof GenerateMCQsInputSchema,
  typeof GenerateMCQsOutputSchema
>(
  {
    name: 'generateMCQsFlow',
    inputSchema: GenerateMCQsInputSchema,
    outputSchema: GenerateMCQsOutputSchema,
  },
  async input => {
    const {output} = await generateMCQsPrompt(input);
    return output!;
  }
);
