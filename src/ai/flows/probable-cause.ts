'use server';
/**
 * @fileOverview This file defines a Genkit flow for determining the probable cause
 * based on user-provided symptoms and answers to multiple-choice questions.
 *
 * - determineProbableCause - A function that takes user symptoms and MCQ answers as input and returns a probable cause.
 * - DetermineProbableCauseInput - The input type for the determineProbableCause function, including user symptoms and MCQ answers.
 * - DetermineProbableCauseOutput - The return type for the determineProbableCause function, providing a probable cause.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DetermineProbableCauseInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user.'),
  mcqAnswers: z.record(z.string(), z.string()).describe('A record of multiple-choice question answers.'),
});
export type DetermineProbableCauseInput = z.infer<typeof DetermineProbableCauseInputSchema>;

const DetermineProbableCauseOutputSchema = z.object({
  probableCause: z.string().describe('The probable cause of the symptoms.'),
});
export type DetermineProbableCauseOutput = z.infer<typeof DetermineProbableCauseOutputSchema>;

export async function determineProbableCause(
  input: DetermineProbableCauseInput
): Promise<DetermineProbableCauseOutput> {
  return determineProbableCauseFlow(input);
}

const determineProbableCausePrompt = ai.definePrompt({
  name: 'determineProbableCausePrompt',
  input: {
    schema: z.object({
      symptoms: z.string().describe('The symptoms described by the user.'),
      mcqAnswers: z.record(z.string(), z.string()).describe('A record of multiple-choice question answers.'),
    }),
  },
  output: {
    schema: z.object({
      probableCause: z.string().describe('The probable cause of the symptoms.'),
    }),
  },
  prompt: `Given the following symptoms: {{{symptoms}}} and the following answers to multiple-choice questions: {{{mcqAnswers}}}, determine the probable cause.

Return the probable cause as a string.`,
});

const determineProbableCauseFlow = ai.defineFlow<
  typeof DetermineProbableCauseInputSchema,
  typeof DetermineProbableCauseOutputSchema
>(
  {
    name: 'determineProbableCauseFlow',
    inputSchema: DetermineProbableCauseInputSchema,
    outputSchema: DetermineProbableCauseOutputSchema,
  },
  async input => {
    const {output} = await determineProbableCausePrompt(input);
    return output!;
  }
);
