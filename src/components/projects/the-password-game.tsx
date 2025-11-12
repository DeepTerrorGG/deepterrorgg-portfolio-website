
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generatePasswordRule } from '@/ai/flows/password-rule-flow';

type Rule = {
  id: number;
  text: string;
  isAi?: boolean;
  validate: (password: string) => boolean;
};

const initialRules: Rule[] = [
  { id: 1, text: 'Your password must be at least 8 characters long.', validate: (p) => p.length >= 8 },
  { id: 2, text: 'Your password must contain an uppercase letter.', validate: (p) => /[A-Z]/.test(p) },
  { id: 3, text: 'Your password must contain a number.', validate: (p) => /\d/.test(p) },
  { id: 4, text: 'Your password must contain a special character.', validate: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(p) },
  { id: 5, text: 'The digits in your password must sum to 15.', validate: (p) => (p.match(/\d/g) || []).reduce((sum, digit) => sum + parseInt(digit), 0) === 15 },
];


const ThePasswordGame: React.FC = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [activeRules, setActiveRules] = useState<Rule[]>([initialRules[0]]);
  const [isLoadingNextRule, setIsLoadingNextRule] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  const validationResults = useMemo(() => {
    return activeRules.map(rule => ({
      ...rule,
      isMet: rule.validate(password),
    }));
  }, [password, activeRules]);

  const allRulesMet = useMemo(() => validationResults.every(r => r.isMet), [validationResults]);

  useEffect(() => {
    if (allRulesMet && !isLoadingNextRule && !isGameWon) {
      const nextRuleIndex = activeRules.length;
      
      if (nextRuleIndex < initialRules.length) {
        // Add next static rule
        setTimeout(() => {
          setActiveRules(prev => [...prev, initialRules[nextRuleIndex]]);
        }, 500);
      } else if(nextRuleIndex < 10) { // Let's cap AI rules for now
        // Fetch AI rule
        setIsLoadingNextRule(true);
        fetchNewAIRule();
      } else {
        setIsGameWon(true);
        toast({ title: "You Win!", description: "You've successfully created a ridiculously secure password!", duration: 5000 });
      }
    }
  }, [allRulesMet, activeRules.length, isLoadingNextRule, isGameWon]);
  
  const fetchNewAIRule = async () => {
    const existingRules = activeRules.map(r => r.text);
    try {
      const newRuleData = await generatePasswordRule(existingRules);
      
      let validationFunc: (password: string) => boolean;
      try {
        // DANGER: Using eval is risky. In a real app, this should be a sandboxed environment.
        // For this portfolio project, it demonstrates the concept.
        validationFunc = new Function('password', `try { return ${newRuleData.validationLogic}; } catch (e) { return false; }`) as (password: string) => boolean;
      } catch (e) {
        console.error("Failed to compile validation function:", e);
        // Fallback or retry
        setIsLoadingNextRule(false);
        return;
      }

      const newRule: Rule = {
        id: Date.now(),
        text: newRuleData.rule,
        isAi: true,
        validate: validationFunc,
      };

      setActiveRules(prev => [...prev, newRule]);
    } catch (error) {
      toast({ title: "AI Rule Generation Failed", description: "Could not fetch a new rule. Please try again.", variant: 'destructive' });
      console.error(error);
    } finally {
      setIsLoadingNextRule(false);
    }
  };
  
  const resetGame = () => {
    setPassword('');
    setActiveRules([initialRules[0]]);
    setIsGameWon(false);
    setIsLoadingNextRule(false);
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">The AI Password Game</CardTitle>
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
                  "flex items-start gap-3 p-3 rounded-md transition-all duration-300",
                  rule.isMet ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
                )}>
                  {rule.isMet ? <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                  <span>{rule.text}</span>
                  {rule.isAi && <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full">AI</span>}
                </li>
              ))}
              {isLoadingNextRule && (
                  <li className="flex items-center gap-3 p-3 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin"/>
                      <span>AI is thinking of the next rule...</span>
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
