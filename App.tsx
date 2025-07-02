import React, { useState, useEffect, useCallback } from 'react';
import { Meal, DayOfWeek, GroceryItem, Theme } from './types';
import { DAYS_OF_WEEK } from './constants';
import WeeklyPlan from './components/WeeklyPlan';
import MealFormModal from './components/MealFormModal';
import GroceryList from './components/GroceryList';
import AiMealGenerator from './components/AiMealGenerator';
import LoginForm from './components/LoginForm';
import { CalendarIcon, SparklesIcon, ShoppingCartIcon, UserIcon } from './components/icons';
import ThemeToggle from './components/ThemeToggle';
import ToastComponent from './components/ToastComponent';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { mealsAPI, groceriesAPI } from './services/apiService';

type View = 'plan' | 'ai' | 'grocery';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { showToast } = useToast();
  
  const [mealPlan, setMealPlan] = useState<Record<DayOfWeek, Meal[]>>(() => {
    const initialPlan: Record<DayOfWeek, Meal[]> = {} as Record<DayOfWeek, Meal[]>;
    DAYS_OF_WEEK.forEach(day => {
      initialPlan[day] = [];
    });
    return initialPlan;
  });
  
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);
  const [currentDay, setCurrentDay] = useState<DayOfWeek>('Monday');
  const [activeView, setActiveView] = useState<View>('plan');

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as Theme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Load data from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadMealPlan();
      loadGroceryList();
    }
  }, [isAuthenticated]);

  const loadMealPlan = async () => {
    try {
      const response = await mealsAPI.getWeeklyPlan();
      const mealsByDay: Record<DayOfWeek, Meal[]> = {} as Record<DayOfWeek, Meal[]>;
      
      // Initialize all days with empty arrays
      DAYS_OF_WEEK.forEach(day => {
        mealsByDay[day] = [];
      });
      
      // Group meals by day
      response.meals.forEach(meal => {
        const day = meal.day_of_week as DayOfWeek;
        if (mealsByDay[day]) {
          mealsByDay[day].push(meal);
        }
      });
      
      setMealPlan(mealsByDay);
    } catch (error) {
      console.error('Failed to load meal plan:', error);
      showToast('Failed to load meal plan', 'error');
    }
  };

  const loadGroceryList = async () => {
    try {
      const response = await groceriesAPI.getGroceryList();
      setGroceryList(response.grocery_items);
    } catch (error) {
      console.error('Failed to load grocery list:', error);
      showToast('Failed to load grocery list', 'error');
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAddMealClick = (day: DayOfWeek) => {
    setCurrentDay(day);
    setMealToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleEditMealClick = (meal: Meal, day: DayOfWeek) => {
    setCurrentDay(day);
    setMealToEdit(meal);
    setIsModalOpen(true);
  };

  const handleSaveMeal = useCallback(async (mealData: Omit<Meal, 'id'>, day: DayOfWeek) => {
    try {
      if (mealToEdit) {
        // Update existing meal
        await mealsAPI.updateMeal(mealToEdit.id.toString(), {
          ...mealData,
          day_of_week: day
        });
        showToast('Meal updated!', 'success');
      } else {
        // Add new meal
        await mealsAPI.addMeal({
          ...mealData,
          day_of_week: day
        });
        showToast('Meal added!', 'success');
      }
      
      // Reload meal plan
      await loadMealPlan();
      setIsModalOpen(false);
      setMealToEdit(null);
    } catch (error) {
      console.error('Failed to save meal:', error);
      showToast('Failed to save meal', 'error');
    }
  }, [mealToEdit, showToast]);
  
  const handleAddAiMeal = useCallback(async (mealData: Omit<Meal, 'id'>, day: DayOfWeek) => {
    try {
      await mealsAPI.addMeal({
        ...mealData,
        day_of_week: day
      });
      showToast(`"${mealData.name}" added to ${day}!`, 'success');
      await loadMealPlan();
    } catch (error) {
      console.error('Failed to add AI meal:', error);
      showToast('Failed to add meal', 'error');
    }
  }, [showToast]);

  const handleDeleteMeal = useCallback(async (mealId: string, day: DayOfWeek) => {
    try {
      await mealsAPI.deleteMeal(mealId);
      showToast('Meal deleted', 'success');
      await loadMealPlan();
    } catch (error) {
      console.error('Failed to delete meal:', error);
      showToast('Failed to delete meal', 'error');
    }
  }, [showToast]);

  const handleToggleGroceryItem = useCallback(async (itemId: string) => {
    try {
      const item = groceryList.find(item => item.id.toString() === itemId);
      if (item) {
        await groceriesAPI.updateGroceryItem(itemId, {
          purchased: !item.purchased
        });
        await loadGroceryList();
      }
    } catch (error) {
      console.error('Failed to toggle grocery item:', error);
      showToast('Failed to update item', 'error');
    }
  }, [groceryList, showToast]);
  
  const handleManualAddGroceryItem = useCallback(async (name: string, quantity: string) => {
    try {
      await groceriesAPI.addGroceryItem({ name, quantity });
      showToast(`${name} added to grocery list`, 'success');
      await loadGroceryList();
    } catch (error) {
      console.error('Failed to add grocery item:', error);
      showToast('Failed to add item', 'error');
    }
  }, [showToast]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const viewTitles: Record<View, string> = {
    plan: 'Your Weekly Plan', 
    ai: 'AI Meal Ideas', 
    grocery: 'Grocery List',
  };

  const renderContent = () => {
    let content;
    switch (activeView) {
      case 'plan':
        content = <WeeklyPlan mealPlan={mealPlan} onAddMeal={handleAddMealClick} onEditMeal={handleEditMealClick} onDeleteMeal={handleDeleteMeal} />;
        break;
      case 'ai':
        content = <AiMealGenerator onAddMeal={handleAddAiMeal} />;
        break;
      case 'grocery':
        content = <GroceryList items={groceryList} onToggleItem={handleToggleGroceryItem} onManualAddItem={handleManualAddGroceryItem} />;
        break;
      default:
        content = null;
    }
    return <div key={activeView} className="animate-fade-in">{content}</div>;
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">MealMate</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle theme={theme} onToggle={setTheme} />
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <UserIcon className="w-4 h-4" />
                <span>{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {Object.entries(viewTitles).map(([view, title]) => (
              <button
                key={view}
                onClick={() => setActiveView(view as View)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeView === view
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {view === 'plan' && <CalendarIcon className="w-5 h-5" />}
                {view === 'ai' && <SparklesIcon className="w-5 h-5" />}
                {view === 'grocery' && <ShoppingCartIcon className="w-5 h-5" />}
                <span>{title}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </main>

      {/* Modal */}
      <MealFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMeal}
        day={currentDay}
        meal={mealToEdit}
      />

      {/* Toast Container */}
      <ToastComponent />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;