'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {suggestRoutes, RouteSuggestion} from '@/ai/flows/suggest-routes';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {
  Clock,
  Compass,
  Heart,
  Home as HomeIcon,
  Microscope,
  Pill as PharmacyIcon,
  Star,
  Wallet,
} from 'lucide-react';
import {generateMCQs, MCQ} from '@/ai/flows/mcq-symptom';
import {determineProbableCause} from '@/ai/flows/probable-cause';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Label} from '@/components/ui/label';

export default function Home() {
  const [symptoms, setSymptoms] = useState('');
  const [routeSuggestions, setRouteSuggestions] = useState<null | {
    costOptimized: RouteSuggestion;
    speedOptimized: RouteSuggestion;
    ratingOptimized: RouteSuggestion;
  }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mcqs, setMcqs] = useState<MCQ[] | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<{[key: string]: string}>({});
  const [probableCause, setProbableCause] = useState<string | null>(null);
  const [allMcqsAnswered, setAllMcqsAnswered] = useState(false);

  useEffect(() => {
    if (mcqs) {
      const answered = mcqs.every(mcq => mcqAnswers[mcq.question]);
      setAllMcqsAnswered(answered);
    } else {
      setAllMcqsAnswered(false);
    }
  }, [mcqs, mcqAnswers]);

  const handleSuggestion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Generate MCQs
      const mcqsResult = await generateMCQs({symptoms});
      setMcqs(mcqsResult.mcqs);
      setRouteSuggestions(null); // Clear previous route suggestions
      setProbableCause(null); // Clear previous probable cause

    } catch (e: any) {
      console.error('Error getting route suggestions:', e);
      setError(e.message || 'Failed to get route suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMCQs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (symptoms) {
        // Determine probable cause
        const probableCauseResult = await determineProbableCause({
          symptoms: symptoms,
          mcqAnswers: mcqAnswers,
        });
        setProbableCause(probableCauseResult.probableCause);

        // Get route suggestions
        const suggestions = await suggestRoutes({symptoms});
        setRouteSuggestions(suggestions);
      }

    } catch (e: any) {
      console.error('Error getting route suggestions:', e);
      setError(e.message || 'Failed to get route suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setMcqAnswers(prev => ({...prev, [question]: answer}));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MediRoute</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Enter Your Symptoms</CardTitle>
          <CardDescription>Describe your symptoms to get smart route
            suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., headache, fever, cough"
            className="mb-2"
          />
          <Button
            onClick={handleSuggestion}
            disabled={isLoading}
            style={{backgroundColor: symptoms ? '#1398ea' : ''}}
          >
            {isLoading ? 'Get Route Suggestions' : 'Get Route Suggestions'}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {mcqs && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Answer these questions to help us understand your
              symptoms better:</CardTitle>
          </CardHeader>
          <CardContent>
            {mcqs.map((mcq, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold">{mcq.question}</p>
                <RadioGroup
                  defaultValue={mcqAnswers[mcq.question] || ''}
                  onValueChange={(answer) => handleAnswerChange(mcq.question, answer)}
                  className="grid gap-2">
                  {mcq.options.map((option, optionIndex) => (
                    <div className="flex items-center space-x-2" key={optionIndex}>
                      <RadioGroupItem value={option} id={`option-${index}-${optionIndex}`}/>
                      <Label htmlFor={`option-${index}-${optionIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <Button
              onClick={handleSubmitMCQs}
              disabled={isLoading || !allMcqsAnswered}
              style={{
                backgroundColor: allMcqsAnswered ? '#1398ea' : '',
                opacity: allMcqsAnswered ? 1 : 0.5,
              }}
            >
              {isLoading ? 'Submit Answers' : 'Submit Answers'}
            </Button>
          </CardContent>
        </Card>
      )}

      {probableCause && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Probable Cause</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{probableCause}</p>
          </CardContent>
        </Card>
      )}

      {routeSuggestions && (
        <>
          <h2 className="text-xl font-semibold mb-2">Route Suggestions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <RouteCard
              title="Cost Optimized"
              route={routeSuggestions.costOptimized}
            />
            <RouteCard
              title="Speed Optimized"
              route={routeSuggestions.speedOptimized}
            />
            <RouteCard
              title="Rating Optimized"
              route={routeSuggestions.ratingOptimized}
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
}: {
  title: string;
  route: RouteSuggestion;
}) {
  let icon;
  let iconColorClass;
  let cardBorderClass = '';

  switch (title) {
    case 'Cost Optimized':
      icon = <Wallet className="mr-2 h-4 w-4"/>;
      iconColorClass = 'text-green-600';
      cardBorderClass = 'border-green-200';
      break;
    case 'Speed Optimized':
      icon = <Clock className="mr-2 h-4 w-4"/>;
      iconColorClass = 'text-blue-600';
      cardBorderClass = 'border-blue-200';
      break;
    case 'Rating Optimized':
      icon = <Star className="mr-2 h-4 w-4"/>;
      iconColorClass = 'text-yellow-500';
      cardBorderClass = 'border-yellow-200';
      break;
    default:
      icon = <Compass className="mr-2 h-4 w-4"/>;
      iconColorClass = '';
      break;
  }

  return (
    <Card className={cardBorderClass}>
      <CardHeader className="flex flex-row items-center pb-2 space-y-0">
        <div className={iconColorClass}>{icon}</div>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <div className="flex items-center">
            <HomeIcon className="mr-2 h-4 w-4"/> Clinic: {route.clinic.name}
          </div>
          <div className="text-muted-foreground text-sm ml-6">{route.clinic.address}</div>
        </div>
        <div className="mb-2">
          <div className="flex items-center">
            <Microscope className="mr-2 h-4 w-4"/> Lab: {route.lab.name}
          </div>
          <div className="text-muted-foreground text-sm ml-6">{route.lab.address}</div>
        </div>
        <div className="mb-2">
          <div className="flex items-center">
            <PharmacyIcon className="mr-2 h-4 w-4"/> Pharmacy: {route.pharmacy.name}
          </div>
          <div className="text-muted-foreground text-sm ml-6">{route.pharmacy.address}</div>
        </div>
        <div className="pt-4 space-y-1 text-sm text-muted-foreground">
          <div>Cost: ${route.costUSD}</div>
          <div>Waiting: {Math.round(route.durationSeconds / 60)} mins</div>
          <div>Rating: {route.rating}</div>
        </div>
      </CardContent>
    </Card>
  );
}
