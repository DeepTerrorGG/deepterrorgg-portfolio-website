
'use client';

import { generateRecipe } from '@/ai/flows/recipe-generator-flow';
import { 
  type Ingredients, 
  type Recipe,
  type RecipeCuisine,
  type RecipeDiet
} from '@/ai/flows/recipe-generator-flow-types';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const diets: RecipeDiet[] = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto'];
const cuisines: RecipeCuisine[] = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'French', 'American'];

export default function AIRecipeGenerator() {
  const [ingredients, setIngredients] = useState<string>('chicken, rice, broccoli');
  const [allergies, setAllergies] = useState<string>('');
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [diet, setDiet] = useState<RecipeDiet>('None');
  const [cuisine, setCuisine] = useState<RecipeCuisine>('Any');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecipe(null);

    const ingredientsList: Ingredients = {
      ingredients: ingredients.split(',').map((i) => i.trim()),
      diet,
      cuisine,
      allergies,
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
            Enter ingredients separated by commas to get a recipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor='ingredients-input'>Ingredients</Label>
                <Input
                  id='ingredients-input'
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g., chicken, rice, broccoli"
                  disabled={loading}
                  className='mt-1'
                />
            </div>
             <div>
                <Label htmlFor='allergies-input'>Allergies / Exclusions</Label>
                <Input
                  id='allergies-input'
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., peanuts, shellfish, dairy"
                  disabled={loading}
                  className='mt-1'
                />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <Label>Dietary Restriction</Label>
                    <Select value={diet} onValueChange={v => setDiet(v as RecipeDiet)}>
                        <SelectTrigger className='mt-1'><SelectValue /></SelectTrigger>
                        <SelectContent>{diets.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Cuisine Style</Label>
                    <Select value={cuisine} onValueChange={v => setCuisine(v as RecipeCuisine)}>
                        <SelectTrigger className='mt-1'><SelectValue /></SelectTrigger>
                        <SelectContent>{cuisines.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

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
              <article className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipe}</ReactMarkdown>
              </article>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      <style jsx global>{`
        .prose h1, .prose h2, .prose h3 {
          color: hsl(var(--primary));
        }
        .prose ul, .prose ol {
          color: hsl(var(--foreground));
        }
       `}</style>
    </div>
  );
}
