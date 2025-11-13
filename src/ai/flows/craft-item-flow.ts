
'use server';

import { ai } from '@/ai/genkit';
import { 
    type CraftItemInput
} from './craft-item-flow-types';
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

export async function craftItem(input: CraftItemInput): Promise<{ result: string | null; isNew: boolean }> {
  const { item1, item2 } = input;
  
  try {
    const { firestore } = initializeFirebase();

    const sortedItems = [item1, item2].sort();
    const recipeKey = sortedItems.join('+');

    const recipesRef = collection(firestore, 'recipes');
    const q = query(recipesRef, where('key', '==', recipeKey));
  
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const existingRecipe = querySnapshot.docs[0].data();
      return { result: existingRecipe.result, isNew: false };
    }
  } catch (error) {
     console.warn(
      "AI Crafting: Could not connect to Firestore. " +
      "The game will rely on the AI for all new crafts, which may be less consistent and slower. " +
      "Ensure your Firebase client config is correct."
    );
  }

  // If not found in DB or DB fails, use AI to generate a new item
  const prompt = `You are a creative crafting game AI, similar to "Infinite Craft" or "Little Alchemy". 
Your task is to determine the logical, creative, or metaphorical result of combining two items. 
Think about the properties of the items and what they would create when mixed. The result should always be a single concept or noun. Be creative and surprising!

Combine the following two items: ${item1} + ${item2}

Here are some examples of good combinations:
- Water + Fire = Steam
- Earth + Water = Mud
- Human + Stone = Sculpture
- Plant + Sun = Tree
- Fire + Human = Blacksmith
- Wind + Stone = Sand
- Glass + Water = Aquarium

Return ONLY the resulting single word or concept, and nothing else. For example, if the result is "Steam", your entire response should be just "Steam".
`;

  const { text } = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: prompt,
  });

  const newResult = text.trim();
  
  if (!newResult) {
    return { result: null, isNew: false };
  }
  
  // Try to save the new recipe to Firestore, but don't block on it.
  try {
    const { firestore } = initializeFirebase();
    const recipesRef = collection(firestore, 'recipes');
    const sortedItems = [item1, item2].sort();
    const recipeKey = sortedItems.join('+');
    
    const newRecipe = {
      key: recipeKey,
      item1: sortedItems[0],
      item2: sortedItems[1],
      result: newResult,
      createdAt: serverTimestamp(),
    };
    await addDoc(recipesRef, newRecipe);
  } catch (error) {
    // Silently fail if the save doesn't work. The game can still proceed.
    console.warn("AI Crafting: Failed to save new recipe to Firestore. The game will continue without persistence for this craft.");
  }
  
  return { result: newResult, isNew: true };
}
