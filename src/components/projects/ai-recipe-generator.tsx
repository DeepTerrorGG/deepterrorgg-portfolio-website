'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, ChefHat, Sandwich } from 'lucide-react';
import { generateRecipe, type GenerateRecipeInput, type GenerateRecipeOutput } from '@/ai/flows/recipe-generator-flow';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const AiRecipeGenerator: React.FC = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState('');
  const [mealType, setMealType] = useState('any');
  const [recipe, setRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateRecipe = async () => {
    if (ingredients.trim() === '') {
      toast({
        title: 'Missing Ingredients',
        description: 'Please list some ingredients to get started.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setRecipe(null);
    try {
      const input: GenerateRecipeInput = { ingredients, mealType };
      const result = await generateRecipe(input);
      setRecipe(result);
    } catch (error) {
      console.error('Failed to generate recipe:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate a recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
        {/* Left column for inputs */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sandwich className="h-6 w-6" />
              <span>Recipe Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g., chicken breast, rice, broccoli, soy sauce"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate ingredients with commas.</p>
            </div>
            <div>
              <Label htmlFor="meal-type">Meal Type</Label>
               <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger id="meal-type">
                    <SelectValue placeholder="Select a meal type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateRecipe} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Recipe
            </Button>
          </CardFooter>
        </Card>
        
        {/* Right column for output */}
        <Card className="shadow-lg">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                <span>Your Custom Recipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[40vh] relative">
            <ScrollArea className="h-full">
                {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                )}
                {recipe ? (
                <div className="space-y-4 pr-4">
                    <h3 className="text-xl font-bold text-primary">{recipe.recipeName}</h3>
                    <p className="text-sm italic text-muted-foreground">{recipe.description}</p>
                    <div>
                        <h4 className="font-semibold mb-2">Prep Time</h4>
                        <p className="text-sm">{recipe.prepTime}</p>
                    </div>
                    <div>
                    <h4 className="font-semibold mb-2">Ingredients</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {recipe.ingredients.map((item, index) => (
                        <li key={index}>{item}</li>
                        ))}
                    </ul>
                    </div>
                    <div>
                    <h4 className="font-semibold mb-2">Instructions</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        {recipe.instructions.map((step, index) => (
                        <li key={index}>{step}</li>
                        ))}
                    </ol>
                    </div>
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p>Your generated recipe will appear here.</p>
                </div>
                )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiRecipeGenerator;
