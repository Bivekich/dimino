import { create } from 'zustand';
import type { CartItem, Dish } from '@/app/types';

interface CartStore {
  items: CartItem[];
  addToCart: (dish: Dish) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  removeFromCart: (dishId: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  addToCart: (dish) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === dish.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === dish.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: dish.id,
            name: dish.name,
            weight: dish.weight,
            quantity: 1,
          },
        ],
      };
    }),
  updateQuantity: (dishId, quantity) =>
    set((state) => ({
      items: state.items
        .map((item) => (item.id === dishId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    })),
  removeFromCart: (dishId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== dishId),
    })),
  clearCart: () => set({ items: [] }),
}));
