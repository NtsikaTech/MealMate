import React from 'react';
import { Meal, Ingredient } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface MealCardProps {
  meal: Meal;
  onEdit: () => void;
  onDelete: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-100">{meal.name}</h4>
          {meal.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meal.notes}</p>}
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <details className="mt-2">
          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer font-medium">Ingredients</summary>
          <ul className="mt-1 pl-4 list-disc text-sm text-gray-600 dark:text-gray-300">
              {meal.ingredients.map((ing, index) => (
                  <li key={index}>
                      <span className="font-medium">{ing.quantity}</span> {ing.name}
                  </li>
              ))}
          </ul>
      </details>
    </div>
  );
};

export default MealCard;