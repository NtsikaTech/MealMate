import React, { useState } from 'react';
import { GroceryItem } from '../types';

interface GroceryListProps {
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onManualAddItem: (name: string, quantity: string) => void;
}

const GroceryList: React.FC<GroceryListProps> = ({ items, onToggleItem, onManualAddItem }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');

  const purchasedItems = items.filter(item => item.purchased).sort((a,b) => a.name.localeCompare(b.name));
  const pendingItems = items.filter(item => !item.purchased).sort((a,b) => a.name.localeCompare(b.name));

  const handleManualAdd = () => {
    if (!newItemName.trim()) return;
    onManualAddItem(newItemName.trim(), newItemQuantity.trim() || '1');
    setNewItemName('');
    setNewItemQuantity('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualAdd();
    }
  };

  const GroceryItemRow: React.FC<{ item: GroceryItem }> = ({ item }) => (
    <li
      key={item.id}
      className="flex items-center justify-between py-3 px-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={() => onToggleItem(item.id)}
          className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-transparent"
        />
        <div className="ml-3 text-sm">
          <label
            className={`font-medium ${item.purchased ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}
          >
            {item.name}
          </label>
          <p className={`text-gray-500 dark:text-gray-400 ${item.purchased ? 'line-through' : ''}`}>
             {item.quantity}{item.mealSource !== 'Manually Added' ? ` (${item.mealSource})` : ''}
          </p>
        </div>
      </div>
    </li>
  );

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Add Item Manually</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="Qty (e.g., 1kg)"
                    className="w-1/3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Item name (e.g., Olive oil)"
                    className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                    onClick={handleManualAdd}
                    disabled={!newItemName.trim()}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Add
                </button>
            </div>
        </div>

        {items.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10 py-8">
                <p>Your grocery list is empty.</p>
                <p className="text-sm">Add some meals or items to get started.</p>
            </div>
        ) : (
            <>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">To Buy</h3>
                {pendingItems.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {pendingItems.map(item => <GroceryItemRow key={item.id} item={item} />)}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">All items purchased!</p>
                )}

                {purchasedItems.length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-6 mb-2">Purchased</h3>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {purchasedItems.map(item => <GroceryItemRow key={item.id} item={item} />)}
                        </ul>
                    </>
                )}
            </>
        )}
    </div>
  );
};

export default GroceryList;