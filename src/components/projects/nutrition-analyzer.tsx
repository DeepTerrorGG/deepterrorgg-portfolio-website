
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Soup, Flame, Wheat, Beef } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeNutrition } from '@/ai/flows/nutrition-analyzer-flow';
import type { NutritionAnalysis } from '@/ai/flows/nutrition-analyzer-flow';
import { Progress } from '../ui/progress';

const NutritionAnalyzer: React.FC = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState('1 cup of rice, 100g of chicken breast, 1 cup of broccoli');
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!ingredients.trim()) {
      toast({ title: 'Ingredients needed', description: 'Please enter a list of ingredients.', variant: 'destructive' });
      return;
    }
    
    // Check for API keys
    if (!process.env.NEXT_PUBLIC_EDAMAM_APP_ID || !process.env.NEXT_PUBLIC_EDAMAM_APP_KEY) {
        toast({ title: 'Configuration Error', description: 'Nutrition API keys are missing. Please add them to your environment variables.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const result = await analyzeNutrition({ ingredients });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      toast({ title: "Analysis Failed", description: (err as Error).message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const NutrientDisplay = ({ label, value, unit, daily, color }: { label: string; value?: number; unit?: string; daily?: number, color: string }) => {
      const displayValue = value !== undefined ? Math.round(value) : 'N/A';
      const displayDaily = daily !== undefined ? Math.round(daily) : 0;
      return (
        <div className="space-y-1">
            <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{displayValue}{unit}</p>
            </div>
            <Progress value={displayDaily} className={color} />
            <p className="text-xs text-muted-foreground text-right">{displayDaily}% DV</p>
        </div>
      );
  }

  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary text-2xl justify-center">
            <Soup /> AI Nutrition Analyzer
          </CardTitle>
          <CardDescription className="text-center">
            Enter a list of ingredients to get an estimated nutritional breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., 1 cup of rice, 100g of chicken breast, 1 cup of broccoli"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
          <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Soup className="mr-2 h-4 w-4" />}
            Analyze Nutrition
          </Button>

          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {analysis && (
            <Card className="mt-4 animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
                       <Flame className="text-orange-500"/> Total Calories: {Math.round(analysis.totalNutrients.ENERC_KCAL?.quantity || 0)} kcal
                    </CardTitle>
                </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <NutrientDisplay 
                    label="Protein" 
                    value={analysis.totalNutrients.PROCNT?.quantity} 
                    unit="g"
                    daily={analysis.totalDaily.PROCNT?.quantity}
                    color="[&>div]:bg-red-500"
                />
                 <NutrientDisplay 
                    label="Carbohydrates" 
                    value={analysis.totalNutrients.CHOCDF?.quantity} 
                    unit="g"
                    daily={analysis.totalDaily.CHOCDF?.quantity}
                    color="[&>div]:bg-blue-500"
                />
                 <NutrientDisplay 
                    label="Fat" 
                    value={analysis.totalNutrients.FAT?.quantity} 
                    unit="g"
                    daily={analysis.totalDaily.FAT?.quantity}
                    color="[&>div]:bg-yellow-500"
                />
                 <NutrientDisplay 
                    label="Fiber" 
                    value={analysis.totalNutrients.FIBTG?.quantity} 
                    unit="g"
                    daily={analysis.totalDaily.FIBTG?.quantity}
                    color="[&>div]:bg-green-500"
                />
                 <NutrientDisplay 
                    label="Sugars" 
                    value={analysis.totalNutrients.SUGAR?.quantity} 
                    unit="g"
                    daily={analysis.totalDaily.SUGAR?.quantity}
                    color="[&>div]:bg-purple-500"
                />
                 <NutrientDisplay 
                    label="Sodium" 
                    value={analysis.totalNutrients.NA?.quantity} 
                    unit="mg"
                    daily={analysis.totalDaily.NA?.quantity}
                    color="[&>div]:bg-sky-500"
                />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionAnalyzer;
