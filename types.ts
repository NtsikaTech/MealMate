export interface Ingredient {
  id?: string | number;
  meal_id?: number;
  name: string;
  quantity: string;
}

export interface Meal {
  id: string | number;
  user_id?: number;
  day_of_week: string;
  name: string;
  notes: string;
  ingredients: Ingredient[];
  created_at?: string;
  updated_at?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type MealPlan = Record<DayOfWeek, Meal[]>;

export interface GroceryItem {
  id: string | number;
  user_id?: number;
  name: string;
  quantity: string;
  purchased: boolean;
  mealSource?: string; // e.g., "Chicken Parmesan"
  created_at?: string;
  updated_at?: string;
}

export type Theme = 'light' | 'dark';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}