'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestRoutes, RouteSuggestion } from '@/ai/flows/suggest-routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Compass,
  Heart,
  Hourglass,
  Home as HomeIcon,
  Microscope,
  Pharmacy as PharmacyIcon,
} from 'lucide-react';

export default function Home() {
  const [symptoms, setSymptoms] = useState('');
  const [routeSuggestions, setRouteSuggestions] = useState<null | {
    costOptimized: RouteSuggestion;
    speedOptimized: RouteSuggestion;
    ratingOptimized: RouteSuggestion;
  }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const suggestions = await suggestRoutes({ symptoms });
      setRouteSuggestions(suggestions);
    } catch (e: any) {
      console.error('Error getting route suggestions:', e);
      setError(e.message || 'Failed to get route suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MediRoute</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Enter Your Symptoms</CardTitle>
          <CardDescription>Describe your symptoms to get smart route suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., headache, fever, cough"
            className="mb-2"
          />
          <Button onClick={handleSuggestion} disabled={isLoading}>
            {isLoading ? 'Suggesting...' : 'Get Route Suggestions'}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {routeSuggestions && (
        <>
          <h2 className="text-xl font-semibold mb-2">Route Suggestions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <RouteCard
              title="Cost Optimized"
              route={routeSuggestions.costOptimized}
              icon={<Compass className="mr-2 h-4 w-4" />}
            />
            <RouteCard
              title="Speed Optimized"
              route={routeSuggestions.speedOptimized}
              icon={<Hourglass className="mr-2 h-4 w-4" />}
            />
            <RouteCard
              title="Rating Optimized"
              route={routeSuggestions.ratingOptimized}
              icon={<Heart className="mr-2 h-4 w-4" />}
            />
          </div>
        </>
      )}
    </div>
  );
}

function RouteCard({
  title,
  route,
  icon,
}: {
  title: string;
  route: RouteSuggestion;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center pb-2 space-y-0">
        {icon}
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <div className="flex items-center">
            <HomeIcon className="mr-2 h-4 w-4" /> Clinic: {route.clinic.name}
          </div>
          <div className="text-muted-foreground text-sm ml-6">{route.clinic.address}</div>
        </div>
        <div className="mb-2">
          <div className="flex items-center">
            <Microscope className="mr-2 h-4 w-4" /> Lab: {route.lab.name}
          </div>
          <div className="text-muted-foreground text-sm ml-6">{route.lab.address}</div>
        </div>
        <div className="mb-2">
          <div className="flex items-center">
            <PharmacyIcon className="mr-2 h-4 w-4" /> Pharmacy: {route.pharmacy.name}
          </div>
          <div className="text-muted-foreground text-sm ml-6">{route.pharmacy.address}</div>
        </div>
        <div className="pt-4 space-y-1 text-sm text-muted-foreground">
          <div>Cost: ${route.costUSD}</div>
          <div>Duration: {Math.round(route.durationSeconds / 60)} mins</div>
          <div>Rating: {route.rating}</div>
        </div>
      </CardContent>
    </Card>
  );
}
