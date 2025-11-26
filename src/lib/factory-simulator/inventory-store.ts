
import { create } from 'zustand';
import { ITEMS, RECIPES, type ItemId, type Recipe } from '@/lib/factory-simulator/registry';
import { toast as sonnerToast } from 'sonner';

interface InventoryState {
  // The User's "Pocket"
  storage: Partial<Record<ItemId, number>>; 
  
  // Actions
  addItem: (id: ItemId, count: number) => void;
  removeItem: (id: ItemId, count: number) => boolean; // Returns false if not enough
  craftItem: (recipeId: string) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  storage: { iron_ore: 10 }, // Start with 10 ore

  addItem: (id, count) => set((state) => ({
    storage: {
      ...state.storage,
      [id]: (state.storage[id] || 0) + count
    }
  })),

  removeItem: (id, count) => {
    const current = get().storage[id] || 0;
    if (current < count) return false; // Not enough items!

    set((state) => ({
      storage: {
        ...state.storage,
        [id]: current - count
      }
    }));
    return true;
  },

  craftItem: (recipeId) => {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    const state = get();

    // 1. Check if we have all ingredients
    const canCraft = recipe.inputs.every(input => 
      (state.storage[input.item] || 0) >= input.count
    );

    if (!canCraft) {
      sonnerToast.error("Not enough ingredients!"); 
      return;
    }

    // 2. Transaction: Remove Ingredients, Add Result
    // This needs to be atomic (happen all at once)
    set((state) => {
      const newStorage = { ...state.storage };
      
      // Remove ingredients
      recipe.inputs.forEach(input => {
        newStorage[input.item] = (newStorage[input.item] || 0) - input.count;
      });

      // Add output
      newStorage[recipe.output] = (newStorage[recipe.output] || 0) + recipe.outputCount;

      return { storage: newStorage };
    });
    
    sonnerToast.success(`Crafted ${recipe.outputCount}x ${ITEMS[recipe.output].name}`);
  }
}));
