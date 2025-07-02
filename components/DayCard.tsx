import React from 'react';
import { Meal, DayOfWeek } from '../types';
import MealCard from './MealCard';
import { PlusIcon } from './icons';

interface DayCardProps {
  day: DayOfWeek;
  meals: Meal[];
  onAddMeal: () => void;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (mealId: string) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, meals, onAddMeal, onEditMeal, onDeleteMeal }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 flex flex-col h-full shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200 mb-4">{day}</h3>
      <div className="space-y-3 flex-grow">
        {meals.length > 0 ? (
          meals.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
              onEdit={() => onEditMeal(meal)}
              onDelete={() => onDeleteMeal(meal.id)}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center h-full">
            <span>No meals planned.</span>
            <span className="text-xs">Click below to add one.</span>
          </div>
        )}
      </div>
      <button
        onClick={onAddMeal}
        className="mt-4 w-full flex items-center justify-center bg-white dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Meal
      </button>
    </div>
  );
};

export default DayCard;