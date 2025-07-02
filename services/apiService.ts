import { Meal, GroceryItem, Ingredient } from '../types';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Types for API responses
interface AuthResponse {
  message: string;
  access_token: string;
  user: {
    id: number;
    email: string;
  };
}

interface UserResponse {
  user: {
    id: number;
    email: string;
    created_at: string;
  };
}

interface MealsResponse {
  meals: Meal[];
}

interface GroceriesResponse {
  grocery_items: GroceryItem[];
}

interface AIResponse {
  meals: Omit<Meal, 'id'>[];
}

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token in localStorage
const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token from localStorage
const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Helper function to make authenticated API requests
const authenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    removeAuthToken();
    throw new Error('Authentication expired. Please login again.');
  }

  return response;
};

// Authentication API
export const authAPI = {
  // Register a new user
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setAuthToken(data.access_token);
    return data;
  },

  // Get user profile
  getProfile: async (): Promise<UserResponse> => {
    const response = await authenticatedRequest('/auth/profile');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    return response.json();
  },

  // Logout user
  logout: (): void => {
    removeAuthToken();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return getAuthToken() !== null;
  },
};

// Meals API
export const mealsAPI = {
  // Get weekly meal plan
  getWeeklyPlan: async (): Promise<MealsResponse> => {
    const response = await authenticatedRequest('/plan');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch meal plan');
    }

    return response.json();
  },

  // Add a new meal
  addMeal: async (meal: {
    day_of_week: string;
    name: string;
    notes?: string;
    ingredients: Ingredient[];
  }): Promise<{ message: string; meal: Meal }> => {
    const response = await authenticatedRequest('/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add meal');
    }

    return response.json();
  },

  // Update a meal
  updateMeal: async (
    mealId: string,
    updates: {
      day_of_week?: string;
      name?: string;
      notes?: string;
      ingredients?: Ingredient[];
    }
  ): Promise<{ message: string; meal: Meal }> => {
    const response = await authenticatedRequest(`/meals/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update meal');
    }

    return response.json();
  },

  // Delete a meal
  deleteMeal: async (mealId: string): Promise<{ message: string }> => {
    const response = await authenticatedRequest(`/meals/${mealId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete meal');
    }

    return response.json();
  },
};

// Groceries API
export const groceriesAPI = {
  // Get grocery list
  getGroceryList: async (): Promise<GroceriesResponse> => {
    const response = await authenticatedRequest('/groceries');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch grocery list');
    }

    return response.json();
  },

  // Add grocery item
  addGroceryItem: async (item: {
    name: string;
    quantity: string;
  }): Promise<{ message: string; item: GroceryItem }> => {
    const response = await authenticatedRequest('/groceries', {
      method: 'POST',
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add grocery item');
    }

    return response.json();
  },

  // Update grocery item (toggle purchased status)
  updateGroceryItem: async (
    itemId: string,
    updates: {
      purchased?: boolean;
      name?: string;
      quantity?: string;
    }
  ): Promise<{ message: string; item: GroceryItem }> => {
    const response = await authenticatedRequest(`/groceries/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update grocery item');
    }

    return response.json();
  },

  // Delete grocery item
  deleteGroceryItem: async (itemId: string): Promise<{ message: string }> => {
    const response = await authenticatedRequest(`/groceries/${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete grocery item');
    }

    return response.json();
  },

  // Clear purchased items
  clearPurchasedItems: async (): Promise<{ message: string; deleted_count: number }> => {
    const response = await authenticatedRequest('/groceries/clear-purchased', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clear purchased items');
    }

    return response.json();
  },
};

// AI API
export const aiAPI = {
  // Generate meal ideas using backend AI service
  generateMealIdeas: async (prompt: string, count: number = 3): Promise<AIResponse> => {
    const response = await authenticatedRequest('/generate-ideas', {
      method: 'POST',
      body: JSON.stringify({ prompt, count }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate meal ideas');
    }

    return response.json();
  },

  // Check AI service health
  checkHealth: async (): Promise<{ status: string; configured: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('AI service health check failed');
    }

    return response.json();
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  const response = await fetch('http://localhost:5000/health');
  
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }

  return response.json();
}; 