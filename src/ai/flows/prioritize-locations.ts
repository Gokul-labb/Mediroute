'use server';
/**
 * @fileOverview This file defines a Genkit flow for prioritizing locations (clinics, labs, pharmacies) based on cost, speed, and user ratings.
 *
 * - prioritizeLocations - A function that prioritizes a list of locations based on the provided criteria.
 * - PrioritizeLocationsInput - The input type for the prioritizeLocations function, including a list of locations and prioritization criteria.
 * - PrioritizeLocationsOutput - The output type for the prioritizeLocations function, which is a list of locations sorted by priority.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const LocationSchema = z.object({
  name: z.string().describe('The name of the location.'),
  type: z.enum(['clinic', 'lab', 'pharmacy']).describe('The type of the location.'),
  lat: z.number().describe('The latitude of the location.'),
  lng: z.number().describe('The longitude of the location.'),
  costUSD: z.number().describe('The estimated cost in USD.'),
  durationSeconds: z.number().describe('The estimated duration in seconds to reach the location.'),
  rating: z.number().describe('The user rating of the location (0-5).'),
});
export type Location = z.infer<typeof LocationSchema>;

const PrioritizeLocationsInputSchema = z.object({
  locations: z.array(LocationSchema).describe('A list of locations to prioritize.'),
  criteria: z
    .enum(['cost', 'speed', 'rating'])
    .describe('The prioritization criteria: cost (lowest cost first), speed (fastest first), or rating (highest rating first).'),
});
export type PrioritizeLocationsInput = z.infer<typeof PrioritizeLocationsInputSchema>;

const PrioritizeLocationsOutputSchema = z.array(LocationSchema);
export type PrioritizeLocationsOutput = z.infer<typeof PrioritizeLocationsOutputSchema>;

export async function prioritizeLocations(input: PrioritizeLocationsInput): Promise<PrioritizeLocationsOutput> {
  return prioritizeLocationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeLocationsPrompt',
  input: {
    schema: z.object({
      locations: z.array(LocationSchema).describe('A list of locations to prioritize.'),
      criteria: z
        .enum(['cost', 'speed', 'rating'])
        .describe('The prioritization criteria: cost (lowest cost first), speed (fastest first), or rating (highest rating first).'),
    }),
  },
  output: {
    schema: z.array(LocationSchema),
  },
  prompt: `You are a helpful assistant that prioritizes a list of locations based on the user's criteria.\n\nThe user will provide a list of locations, each with a name, type (clinic, lab, or pharmacy), latitude, longitude, cost, duration, and rating. The user will also specify a prioritization criteria (cost, speed, or rating).\n\nYour task is to return the list of locations sorted according to the specified criteria.\n\nLocations:\n{{#each locations}}\n- Name: {{this.name}}, Type: {{this.type}}, Cost: {{this.costUSD}}, Duration: {{this.durationSeconds}}, Rating: {{this.rating}}\n{{/each}}\n\nCriteria: {{criteria}}\n\nPrioritized Locations:\n`, // Ensure the prompt instructs the model to return a sorted list of locations
});

const prioritizeLocationsFlow = ai.defineFlow<
  typeof PrioritizeLocationsInputSchema,
  typeof PrioritizeLocationsOutputSchema
>(
  {
    name: 'prioritizeLocationsFlow',
    inputSchema: PrioritizeLocationsInputSchema,
    outputSchema: PrioritizeLocationsOutputSchema,
  },
  async input => {
    const {locations, criteria} = input;

    // Sort the locations based on the criteria.
    let sortedLocations: Location[] = [];
    switch (criteria) {
      case 'cost':
        sortedLocations = [...locations].sort((a, b) => a.costUSD - b.costUSD);
        break;
      case 'speed':
        sortedLocations = [...locations].sort((a, b) => a.durationSeconds - b.durationSeconds);
        break;
      case 'rating':
        sortedLocations = [...locations].sort((a, b) => b.rating - a.rating);
        break;
      default:
        // If the criteria is not recognized, return the original list.
        sortedLocations = locations;
    }

    // Call the prompt to potentially further refine the prioritization or add context.
    // Even though the list is already sorted, the prompt can be used to add a description or summary.
    const {output} = await prompt({
      locations: sortedLocations,
      criteria: criteria,
    });

    return sortedLocations; // Return the sorted locations.
  }
);
