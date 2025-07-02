import React, { useState, useEffect } from 'react';
import { Meal, DayOfWeek, Ingredient } from '../types';
import { XIcon } from './icons';

interface MealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Omit<Meal, 'id'>, day: DayOfWeek) => void;
  mealToEdit?: Meal | null;
  day: DayOfWeek;
}

const MealFormModal: React.FC<MealFormModalProps> = ({ isOpen, onClose, onSave, mealToEdit, day }) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [ingredientsStr, setIngredientsStr] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mealToEdit) {
      setName(mealToEdit.name);
      setNotes(mealToEdit.notes);
      const ingredientsText = mealToEdit.ingredients.map(ing => `${ing.quantity}, ${ing.name}`).join('\n');
      setIngredientsStr(ingredientsText);
    } else {
      setName('');
      setNotes('');
      setIngredientsStr('');
    }
    setError('');
  }, [mealToEdit, isOpen]);

  const parseIngredients = (text: string): Ingredient[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(',');
        const quantity = parts.length > 1 ? parts[0].trim() : '1';
        const name = parts.length > 1 ? parts.slice(1).join(',').trim() : parts[0].trim();
        return { name, quantity };
      })
      .filter(ing => ing.name.length > 0);
  };

  const handleSave = () => {
    if (!name) {
      setError('Meal name is required.');
      return;
    }
    const ingredients = parseIngredients(ingredientsStr);
    if (ingredients.length === 0) {
      setError('At least one ingredient is required.');
      return;
    }

    onSave({ name, notes, ingredients }, day);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg relative transform transition-all scale-100 animate-in fade-in-0 zoom-in-95">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{mealToEdit ? 'Edit Meal' : 'Add Meal'} for {day}</h2>
        
        {error && <p className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm">{error}</p>}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="meal-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meal Name</label>
            <input
              type="text"
              id="meal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Spaghetti Carbonara"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., A quick and classic Italian dish."
            />
          </div>
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ingredients</label>
            <textarea
              id="ingredients"
              value={ingredientsStr}
              onChange={(e) => setIngredientsStr(e.target.value)}
              rows={5}
              className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              placeholder="One per line, format: quantity, name&#10;e.g., 200g, Spaghetti&#10;150g, Pancetta&#10;2, Large eggs"
            />
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Format: `quantity, name`. If no quantity, just the name.</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Meal
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealFormModal;