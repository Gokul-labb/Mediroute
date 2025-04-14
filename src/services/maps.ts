/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents a route with distance, duration and cost.
 */
export interface Route {
  /**
   * The distance in meters.
   */
  distanceMeters: number;
  /**
   * The duration in seconds.
   */
  durationSeconds: number;
    /**
   * The cost in USD.
   */
  costUSD: number;
}

/**
 * Asynchronously retrieves a route between two locations.
 *
 * @param origin The origin location.
 * @param destination The destination location.
 * @returns A promise that resolves to a Route object containing distance and duration.
 */
export async function getRoute(origin: Location, destination: Location): Promise<Route> {
  // TODO: Implement this by calling an API.

  return {
    distanceMeters: 1000,
    durationSeconds: 600,
    costUSD: 10,
  };
}
