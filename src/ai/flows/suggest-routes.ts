'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting routes based on user-provided symptoms.
 *
 * - suggestRoutes - A function that takes user symptoms as input and returns three route suggestions (cost, speed, rating) for clinics, labs, and pharmacies.
 * - SuggestRoutesInput - The input type for the suggestRoutes function, including user symptoms.
 * - SuggestRoutesOutput - The return type for the suggestRoutes function, providing three route suggestions.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getRoute, Location} from '@/services/maps';

const SuggestRoutesInputSchema = z.object({
  symptoms: z.string().describe('The symptoms described by the user.'),
});
export type SuggestRoutesInput = z.infer<typeof SuggestRoutesInputSchema>;

const RouteSuggestionSchema = z.object({
  clinic: z.object({
    name: z.string().describe('Name of the clinic.'),
    address: z.string().describe('Address of the clinic.'),
    location: z.object({
      lat: z.number().describe('Latitude of the clinic.'),
      lng: z.number().describe('Longitude of the clinic.'),
    }).describe('The location of the clinic'),
  }).describe('Clinic details'),
  lab: z.object({
    name: z.string().describe('Name of the lab.'),
    address: z.string().describe('Address of the lab.'),
     location: z.object({
      lat: z.number().describe('Latitude of the lab.'),
      lng: z.number().describe('Longitude of the lab.'),
    }).describe('The location of the lab'),
  }).describe('Lab details'),
  pharmacy: z.object({
    name: z.string().describe('Name of the pharmacy.'),
    address: z.string().describe('Address of the pharmacy.'),
    location: z.object({
      lat: z.number().describe('Latitude of the pharmacy.'),
      lng: z.number().describe('Longitude of the pharmacy.'),
    }).describe('The location of the pharmacy'),
  }).describe('Pharmacy details'),
  costUSD: z.number().describe('Total estimated cost of the route in USD.'),
  durationSeconds: z.number().describe('Total estimated duration of the route in seconds.'),
  rating: z.number().describe('Average user rating for the route (1-5).'),
});

export type RouteSuggestion = z.infer<typeof RouteSuggestionSchema>;

const SuggestRoutesOutputSchema = z.object({
  costOptimized: RouteSuggestionSchema.describe('The route optimized for cost.'),
  speedOptimized: RouteSuggestionSchema.describe('The route optimized for speed.'),
  ratingOptimized: RouteSuggestionSchema.describe('The route optimized for rating.'),
});

export type SuggestRoutesOutput = z.infer<typeof SuggestRoutesOutputSchema>;

export async function suggestRoutes(input: SuggestRoutesInput): Promise<SuggestRoutesOutput> {
  return suggestRoutesFlow(input);
}

const findOptimalRoutesPrompt = ai.definePrompt({
  name: 'findOptimalRoutesPrompt',
  input: {
    schema: z.object({
      symptoms: z.string().describe('The symptoms described by the user.'),
    }),
  },
  output: {
    schema: z.object({
      costOptimized: z.object({
        clinic: z.object({
          name: z.string().describe('Name of the clinic.'),
          address: z.string().describe('Address of the clinic.'),
          location: z.object({
            lat: z.number().describe('Latitude of the clinic.'),
            lng: z.number().describe('Longitude of the clinic.'),
          }).describe('The location of the clinic'),
        }).describe('Clinic details'),
        lab: z.object({
          name: z.string().describe('Name of the lab.'),
          address: z.string().describe('Address of the lab.'),
           location: z.object({
            lat: z.number().describe('Latitude of the lab.'),
            lng: z.number().describe('Longitude of the lab.'),
          }).describe('The location of the lab'),
        }).describe('Lab details'),
        pharmacy: z.object({
          name: z.string().describe('Name of the pharmacy.'),
          address: z.string().describe('Address of the pharmacy.'),
          location: z.object({
            lat: z.number().describe('Latitude of the pharmacy.'),
            lng: z.number().describe('Longitude of the pharmacy.'),
          }).describe('The location of the pharmacy'),
        }).describe('Pharmacy details'),
        costUSD: z.number().describe('Total estimated cost of the route in USD.'),
        durationSeconds: z.number().describe('Total estimated duration of the route in seconds.'),
        rating: z.number().describe('Average user rating (1-5).'),
      }).describe('The route optimized for cost.'),
      speedOptimized: z.object({
        clinic: z.object({
          name: z.string().describe('Name of the clinic.'),
          address: z.string().describe('Address of the clinic.'),
           location: z.object({
            lat: z.number().describe('Latitude of the clinic.'),
            lng: z.number().describe('Longitude of the clinic.'),
          }).describe('The location of the clinic'),
        }).describe('Clinic details'),
        lab: z.object({
          name: z.string().describe('Name of the lab.'),
          address: z.string().describe('Address of the lab.'),
           location: z.object({
            lat: z.number().describe('Latitude of the lab.'),
            lng: z.number().describe('Longitude of the lab.'),
          }).describe('The location of the lab'),
        }).describe('Lab details'),
        pharmacy: z.object({
          name: z.string().describe('Name of the pharmacy.'),
          address: z.string().describe('Address of the pharmacy.'),
          location: z.object({
            lat: z.number().describe('Latitude of the pharmacy.'),
            lng: z.number().describe('Longitude of the pharmacy.'),
          }).describe('The location of the pharmacy'),
        }).describe('Pharmacy details'),
        costUSD: z.number().describe('Total estimated cost of the route in USD.'),
        durationSeconds: z.number().describe('Total estimated duration of the route in seconds.'),
        rating: z.number().describe('Average user rating (1-5).'),
      }).describe('The route optimized for speed.'),
      ratingOptimized: z.object({
        clinic: z.object({
          name: z.string().describe('Name of the clinic.'),
          address: z.string().describe('Address of the clinic.'),
           location: z.object({
            lat: z.number().describe('Latitude of the clinic.'),
            lng: z.number().describe('Longitude of the clinic.'),
          }).describe('The location of the clinic'),
        }).describe('Clinic details'),
        lab: z.object({
          name: z.string().describe('Name of the lab.'),
          address: z.string().describe('Address of the lab.'),
           location: z.object({
            lat: z.number().describe('Latitude of the lab.'),
            lng: z.number().describe('Longitude of the lab.'),
          }).describe('The location of the lab'),
        }).describe('Lab details'),
        pharmacy: z.object({
          name: z.string().describe('Name of the pharmacy.'),
          address: z.string().describe('Address of the pharmacy.'),
          location: z.object({
            lat: z.number().describe('Latitude of the pharmacy.'),
            lng: z.number().describe('Longitude of the pharmacy.'),
          }).describe('The location of the pharmacy'),
        }).describe('Pharmacy details'),
        costUSD: z.number().describe('Total estimated cost of the route in USD.'),
        durationSeconds: z.number().describe('Total estimated duration of the route in seconds.'),
        rating: z.number().describe('Average user rating (1-5).'),
      }).describe('The route optimized for rating.'),
    }),
  },
  prompt: `Given the following symptoms: {{{symptoms}}}, suggest three optimized routes for the user, considering clinic, lab, and pharmacy visits.

Prioritize the routes based on:
1. Cost: Minimize the total cost.
2. Speed: Minimize the total travel time.
3. Rating: Maximize the average user rating.

Ensure each route includes:
- Clinic: Name, address, and location (latitude, longitude).
- Lab: Name, address, and location (latitude, longitude).
- Pharmacy: Name, address, and location (latitude, longitude).
- Total estimated cost in USD.
- Total estimated duration in seconds.
- Average user rating (1-5).

Return the routes in JSON format.`,
});

const suggestRoutesFlow = ai.defineFlow<
  typeof SuggestRoutesInputSchema,
  typeof SuggestRoutesOutputSchema
>(
  {
    name: 'suggestRoutesFlow',
    inputSchema: SuggestRoutesInputSchema,
    outputSchema: SuggestRoutesOutputSchema,
  },
  async input => {
    const {output} = await findOptimalRoutesPrompt(input);
    // TODO: implement using the maps service
    // For the cost and duration values, call the map service.
    return output!;
  }
);


