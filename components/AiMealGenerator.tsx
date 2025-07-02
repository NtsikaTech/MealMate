import React, { useState } from 'react';
import { aiAPI } from '../services/apiService';
import { Meal, DayOfWeek } from '../types';
import { SparklesIcon, PlusIcon } from './icons';
import { DAYS_OF_WEEK } from '../constants';

interface AiMealGeneratorProps {
  onAddMeal: (meal: Omit<Meal, 'id'>, day: DayOfWeek) => void;
}

const SuggestionSkeleton = () => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        <div className="absolute inset-0 transform -translate-x-full bg-gradient-to-r from-transparent via-gray-200/20 dark:via-gray-700/20 to-transparent animate-shimmer"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
        <div className="flex gap-2">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
    </div>
);

const AiMealGenerator: React.FC<AiMealGeneratorProps> = ({ onAddMeal }) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] =useState<Omit<Meal, 'id'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToDay, setAddingToDay] = useState<Record<number, DayOfWeek | ''>>({});

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter your meal preferences.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await aiAPI.generateMealIdeas(prompt, 3);
      setSuggestions(result.meals);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMeal = (meal: Omit<Meal, 'id'>, index: number) => {
    const day = addingToDay[index];
    if (day) {
        onAddMeal(meal, day);
        setAddingToDay(prev => ({ ...prev, [index]: '' }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <SparklesIcon className="w-8 h-8 text-indigo-500" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Meal Ideas</h2>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Stuck in a rut? Describe what you're craving, and let our AI chef whip up some ideas!
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'quick high-protein vegan dinners'"
          className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50 disabled:cursor-not-allowed w-[100px]"
        >
          {isLoading ? (
             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Generate'
          )}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}

      <div className="mt-6 space-y-4">
        {isLoading && (
            <>
                <SuggestionSkeleton />
                <SuggestionSkeleton />
                <SuggestionSkeleton />
            </>
        )}
        {suggestions.map((meal, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-gray-100">{meal.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{meal.notes}</p>
            <details className="mt-2">
                <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer font-medium">Ingredients</summary>
                <ul className="mt-1 pl-4 list-disc text-sm text-gray-600 dark:text-gray-300">
                    {meal.ingredients.map((ing, ingIndex) => (
                        <li key={ingIndex}>
                            <span className="font-medium">{ing.quantity}</span> {ing.name}
                        </li>
                    ))}
                </ul>
            </details>
            <div className="mt-3 flex gap-2">
                <select 
                    value={addingToDay[index] || ''}
                    onChange={(e) => setAddingToDay(prev => ({...prev, [index]: e.target.value as DayOfWeek}))}
                    className="flex-grow border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                    <option value="" disabled>Add to day...</option>
                    {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <button
                    onClick={() => handleAddMeal(meal, index)}
                    disabled={!addingToDay[index]}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                    <PlusIcon className="w-4 h-4 mr-1"/>
                    Add
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiMealGenerator;