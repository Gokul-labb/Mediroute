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
import {determineProbableCause, DetermineProbableCauseOutput} from '@/ai/flows/probable-cause';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

export default function Home() {
  const [symptoms, setSymptoms] = useState('');
  const [location, setLocation] = useState('');
  const [visitPreference, setVisitPreference] = useState('');
  const [budget, setBudget] = useState('');
  const [metric, setMetric] = useState('');
  const [showPreferenceFields, setShowPreferenceFields] = useState(false);

  const [routeSuggestions, setRouteSuggestions] = useState<null | {
    costOptimized: RouteSuggestion;
    speedOptimized: RouteSuggestion;
    ratingOptimized: RouteSuggestion;
  }>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mcqs, setMcqs] = useState<MCQ[] | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<{[key: string]: string}>({});
  const [probableCause, setProbableCause] = useState<DetermineProbableCauseOutput | null>(null);
  const [severityScore, setSeverityScore] = useState<number | null>(null);
  const [severityZone, setSeverityZone] = useState<string | null>(null);
  const [predictedDisease, setPredictedDisease] = useState<string | null>(null);
  const [allMcqsAnswered, setAllMcqsAnswered] = useState(false);

  useEffect(() => {
    if (mcqs) {
      const answered = mcqs.every(mcq => mcqAnswers[mcq.question]);
      setAllMcqsAnswered(answered);
    } else {
      setAllMcqsAnswered(false);
    }
  }, [mcqs, mcqAnswers]);

  const handleSymptomSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Generate MCQs
      const mcqsResult = await generateMCQs({symptoms});
      setMcqs(mcqsResult.mcqs);
      setRouteSuggestions(null); // Clear previous route suggestions
      setProbableCause(null); // Clear previous probable cause
      setSeverityScore(null); // Clear previous severity score
      setShowPreferenceFields(true); // Show preference fields

    } catch (e: any) {
      console.error('Error generating MCQs:', e);
      setError(e.message || 'Failed to generate MCQs');
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

        setProbableCause(probableCauseResult);
        setSeverityScore(probableCauseResult.severityScore);
        setSeverityZone(probableCauseResult.severityZone);
        setPredictedDisease(probableCauseResult.predictedDisease);

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
            onClick={handleSymptomSubmit}
            disabled={isLoading}
            style={{backgroundColor: symptoms ? '#1398ea' : ''}}
          >
            {isLoading ? 'Suggest route' : 'Suggest route'}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showPreferenceFields && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
            <CardDescription>Tell us more about what you're looking
              for.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <Label htmlFor="location">Your Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your city or address"
                className="mb-2"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="visitPreference">Visit Preference</Label>
              <Select value={visitPreference} onValueChange={setVisitPreference}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a preference"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-2">
              <Label htmlFor="budget">Your Budget</Label>
              <Input
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., $50-$100"
                className="mb-2"
              />
            </div>
            <div className="mb-2">
              <Label htmlFor="metric">Most Important Metric</Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a metric"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="speed">Speed</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>
      )}

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
            <p>{probableCause.probableCause}</p>
            {severityScore !== null && (
              <p>Severity Score: {severityScore} / 100</p>
            )}
            {severityZone !== null && (
              <p>Severity Zone: {severityZone}</p>
            )}
            {predictedDisease !== null && (
              <p>Predicted Disease: {predictedDisease}</p>
            )}
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
  let cardClass = '';

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
    <Card className={`${cardBorderClass} ${cardClass}`}>
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

