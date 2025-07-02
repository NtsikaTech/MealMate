import React from 'react';
import { MealPlan, Meal, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import DayCard from './DayCard';

interface WeeklyPlanProps {
  mealPlan: MealPlan;
  onAddMeal: (day: DayOfWeek) => void;
  onEditMeal: (meal: Meal, day: DayOfWeek) => void;
  onDeleteMeal: (mealId: string, day: DayOfWeek) => void;
}

const WeeklyPlan: React.FC<WeeklyPlanProps> = ({ mealPlan, onAddMeal, onEditMeal, onDeleteMeal }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {DAYS_OF_WEEK.map(day => (
        <DayCard
          key={day}
          day={day}
          meals={mealPlan[day]}
          onAddMeal={() => onAddMeal(day)}
          onEditMeal={(meal) => onEditMeal(meal, day)}
          onDeleteMeal={(mealId) => onDeleteMeal(mealId, day)}
        />
      ))}
    </div>
  );
};

export default WeeklyPlan;