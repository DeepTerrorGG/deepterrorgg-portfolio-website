
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { initialRules, rulePool, type Rule } from '@/lib/password-rules';
import { generatePasswordRule, validatePasswordRule } from '@/ai/flows/password-rule-flow';
import { getFormattedTime } from './password-game/current-time';
import { getCurrentWeather } from './password-game/current-weather';

const ThePasswordGame: React.FC = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [activeRules, setActiveRules] = useState<Rule[]>([initialRules[0]]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isFetchingRule, setIsFetchingRule] = useState(false);
  const [aiValidationResults, setAiValidationResults] = useState<Record<number, boolean | null>>({});

  // Dynamic values that rules might depend on
  const [currentTime, setCurrentTime] = useState(getFormattedTime());
  const [weather, setWeather] = useState(getCurrentWeather());

  useEffect(() => {
    const timeTimer = setInterval(() => setCurrentTime(getFormattedTime()), 1000); // Update every second
    const weatherTimer = setInterval(() => setWeather(getCurrentWeather()), 60000); // Update weather every minute
    return () => {
      clearInterval(timeTimer);
      clearInterval(weatherTimer);
    }
  }, []);

  const validationResults = useMemo(() => {
    return activeRules.map(rule => {
      let isMet = false;
      if (rule.isAi) {
        isMet = aiValidationResults[rule.id] === true;
      } else if (rule.id === 301) { // Live Time Rule
        isMet = password.includes(currentTime);
      } else if (rule.id === 302) { // Weather Rule
        isMet = weather ? password.toLowerCase().includes(weather.toLowerCase()) : false;
      }
      else {
        isMet = rule.validate(password);
      }
      return { ...rule, isMet };
    });
  }, [password, activeRules, aiValidationResults, currentTime, weather]);

  const allRulesMet = useMemo(() => validationResults.every(r => r.isMet), [validationResults]);

  const fetchNewAIRule = useCallback(async () => {
    if (isFetchingRule) return;
    setIsFetchingRule(true);
    try {
      const existingRuleTexts = activeRules.map(r => r.text);
      const newRuleData = await generatePasswordRule(existingRuleTexts);
      
      if (newRuleData) {
        const newRule: Rule = {
          id: Date.now(), // Unique ID for the new rule
          text: newRuleData.rule,
          isAi: true,
          validate: () => false, // This will be handled by AI validation
        };
        setAiValidationResults(prev => ({ ...prev, [newRule.id]: false }));
        setActiveRules(prev => [...prev, newRule]);
      } else {
        toast({ title: "AI rule generation failed", description: "Could not generate a new rule. Please try again.", variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "AI Error", description: "An error occurred while fetching a new rule.", variant: 'destructive' });
    }
    setIsFetchingRule(false);
  }, [activeRules, toast, isFetchingRule]);

  // This effect hook handles the main game loop of adding new rules.
  useEffect(() => {
    // We only proceed if all current rules are met and the game isn't already won.
    if (allRulesMet && !isGameWon) {
      const currentRuleIds = new Set(activeRules.map(r => r.id));

      // 1. Try to add the next rule from the predefined initial sequence.
      const nextInitialRule = initialRules.find(r => !currentRuleIds.has(r.id));
      if (nextInitialRule) {
        setActiveRules(prev => [...prev, nextInitialRule]);
        return;
      }

      // 2. If initial rules are done, check from the random pool.
      const availablePoolRules = rulePool.filter(r => !currentRuleIds.has(r.id));
      if (availablePoolRules.length > 0) {
        // Decide whether to fetch an AI rule or pick a standard one.
        const shouldFetchAiRule = activeRules.length > 5 && Math.random() < 0.25;

        if (shouldFetchAiRule) {
          fetchNewAIRule();
        } else {
          // Add a standard rule from the pool.
          const randomIndex = Math.floor(Math.random() * availablePoolRules.length);
          let ruleToAdd = availablePoolRules[randomIndex];
          
          // Special handling for dynamic rules that need current data in their text.
          if (ruleToAdd.id === 301) { // Time rule
            ruleToAdd.text = `Your password must include the current time: ${currentTime}`;
          }
          if (ruleToAdd.id === 302 && weather) { // Weather rule
             ruleToAdd.text = `The current weather in New York is "${weather}". Your password must include this word.`;
          }

          setActiveRules(prev => [...prev, ruleToAdd]);
        }
        return; // Exit after adding a rule.
      }
      
      // 3. If no more rules are left in any pool and we're not fetching an AI rule, the game is won.
      if (!isFetchingRule) {
        setIsGameWon(true);
        toast({ title: "You Win!", description: "You've successfully created a ridiculously secure password!", duration: 5000 });
      }
    }
  }, [allRulesMet, activeRules.length, isGameWon, toast, isFetchingRule, fetchNewAIRule, currentTime, weather]);
  
  const resetGame = () => {
    setPassword('');
    setActiveRules([initialRules[0]]);
    setIsGameWon(false);
    setAiValidationResults({});
    setIsFetchingRule(false);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">The Password Game: Nightmare Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="password-input" className="font-semibold mb-2 block">Create Your Password</label>
            <Input
              id="password-input"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className={cn(
                "text-lg transition-all",
                !isGameWon && password.length > 0 && allRulesMet && "border-green-500 focus-visible:ring-green-500",
                !isGameWon && password.length > 0 && !allRulesMet && "border-red-500 focus-visible:ring-red-500"
              )}
            />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold">Rules:</h3>
            <ul className="space-y-2">
              {validationResults.map(rule => (
                <li key={rule.id} className={cn(
                  "flex items-start gap-3 p-3 rounded-md transition-all duration-300 flex-col",
                  rule.isMet ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
                )}>
                    <div className="flex items-start gap-3">
                        {aiValidationResults[rule.id] === null && rule.isAi ? <Loader2 className="h-5 w-5 mt-0.5 flex-shrink-0 animate-spin" /> :
                         rule.isMet ? <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                        <span>
                          {rule.id === 301 ? `Your password must include the current time: ${currentTime}` :
                           rule.id === 302 && weather ? `The current weather in New York is "${weather}". Your password must include this word.` :
                           rule.text
                          }
                        </span>
                    </div>
                     {rule.component && (
                        <div className="pl-8 pt-2 w-full">
                           <rule.component />
                        </div>
                    )}
                </li>
              ))}
               {isFetchingRule && (
                 <li className="flex items-center gap-3 p-3 rounded-md bg-muted/50 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>The AI is thinking of a new rule...</span>
                 </li>
               )}
               {isGameWon && (
                  <li className="flex items-center gap-3 p-3 rounded-md bg-green-500/10 text-green-300 font-bold text-lg">
                      <CheckCircle2 className="h-6 w-6"/>
                      <span>Congratulations! You've won!</span>
                  </li>
               )}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={resetGame} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Game
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ThePasswordGame;
