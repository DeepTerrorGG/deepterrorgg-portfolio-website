
'use client';

import {
  generateRecipe,
  Ingredients,
  Recipe,
} from '@/ai/flows/recipe-generator-flow';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AIRecipeGenerator() {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecipe(null);

    const ingredientsList: Ingredients = {
      ingredients: ingredients.split(',').map((i) => i.trim()),
    };

    try {
      const result = await generateRecipe(ingredientsList);
      if (result) {
        setRecipe(result);
      }
    } catch (error) {
      console.error(error);
      // Handle error display
    }

    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 flex items-center justify-center bg-card h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>AI Recipe Generator</CardTitle>
          <CardDescription>
            Enter ingredients separated by commas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., chicken, rice, broccoli"
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Recipe
            </Button>
          </form>

          {loading && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {recipe && (
            <ScrollArea className="mt-6 border p-4 rounded-md h-[40vh]">
              <h2 className="text-2xl font-bold text-primary">{recipe.name}</h2>
              <p className="mt-2 text-muted-foreground">{recipe.description}</p>
              <h3 className="mt-4 text-xl font-semibold">Instructions</h3>
              <ul className="mt-2 list-decimal list-inside space-y-2">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
