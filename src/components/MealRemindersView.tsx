import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  CheckCircle2,
  Clock,
  Droplets,
  Scale,
  X,
} from 'lucide-react';
import { MealReminder, PetProfile } from '../types';
import { playSuccessChime } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface MealRemindersViewProps {
  meals: MealReminder[];
  pet: PetProfile;
  waterIntakeBowls: number;
  onUpdateWaterIntake: (delta: number) => void;
  onToggleMealFed: (id: string) => void;
  onAddMeal: (meal: MealReminder) => void;
}

export const MealRemindersView: React.FC<MealRemindersViewProps> = ({
  meals,
  pet,
  waterIntakeBowls,
  onUpdateWaterIntake,
  onToggleMealFed,
  onAddMeal,
}) => {
  const { themeConfig } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState<MealReminder['label']>('Breakfast');
  const [newTime, setNewTime] = useState('08:00');
  const [newGrams, setNewGrams] = useState('180');
  const [newDesc, setNewDesc] = useState('');
  const [newFoodType, setNewFoodType] = useState<MealReminder['foodType']>('Dry Kibble');

  const fedCount = meals.filter((m) => m.fedToday).length;
  const totalGramsTarget = meals.reduce((acc, m) => acc + m.portionGrams, 0);
  const fedGrams = meals.filter((m) => m.fedToday).reduce((acc, m) => acc + m.portionGrams, 0);
  const compliancePercent = meals.length > 0 ? Math.round((fedCount / meals.length) * 100) : 0;

  const handleCreateMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeal: MealReminder = {
      id: `meal-${Date.now()}`,
      petId: pet.id,
      label: newLabel,
      time: newTime,
      portionGrams: parseInt(newGrams, 10) || 150,
      portionDesc: newDesc.trim() || `${newGrams}g of ${newFoodType}`,
      foodType: newFoodType,
      fedToday: false,
      reminderEnabled: true,
    };
    onAddMeal(newMeal);
    playSuccessChime();
    setIsAddModalOpen(false);
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            Daily Meal Reminders & Nutrition
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Portion control, scheduled feeding reminders, and hydration monitoring for {pet.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Meal
        </button>
      </div>

      {/* Daily Nutrition & Hydration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Feeding Compliance */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Today's Feeding
            </span>
            <span className="font-mono text-stone-700 dark:text-stone-300 font-bold">{compliancePercent}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
            {fedCount} of {meals.length} Meals Fed
          </div>
          <div className="mt-3 w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${compliancePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-medium">
            {fedGrams}g of {totalGramsTarget}g daily portion dispensed.
          </p>
        </div>

        {/* Metric 2: Hydration Bowls Tracker */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Hydration Checkpoints
            </span>
            <span className="font-mono text-stone-500 dark:text-stone-400">Target: 3-4 Bowls</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {waterIntakeBowls} Fresh Bowls
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUpdateWaterIntake(-1)}
                disabled={waterIntakeBowls <= 0}
                className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center font-bold text-stone-600 dark:text-stone-300 disabled:opacity-30"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateWaterIntake(1);
                  playSuccessChime();
                }}
                className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-xs"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((bowlNum) => (
              <div
                key={bowlNum}
                className={`flex-1 h-2 rounded-full transition-all ${
                  bowlNum <= waterIntakeBowls ? 'bg-sky-500' : 'bg-stone-200 dark:bg-stone-700'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-medium">
            Clean water replenished & verified for optimal hydration.
          </p>
        </div>

        {/* Metric 3: Breed Caloric Recommendation */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Body Weight Target
            </span>
            <span className="font-mono text-stone-600 dark:text-stone-300 font-medium">{pet.weightKg} kg</span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
            ~1,450 kcal / day
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
            Calibrated for a {pet.ageYears}-year-old active {pet.breed}. Adjust portions based on daily collar activity level.
          </div>
        </div>
      </div>

      {/* Meal Reminder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
              meal.fedToday
                ? 'bg-stone-50/60 dark:bg-stone-800/40 border-emerald-300 dark:border-emerald-800/60'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    {meal.foodType}
                  </span>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {meal.label}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-stone-600 dark:text-stone-300">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  {meal.time}
                </div>
              </div>

              <div className="space-y-1.5 mt-3">
                <div className="text-xs text-stone-700 dark:text-stone-300">
                  Portion: <strong className="font-mono">{meal.portionGrams}g</strong>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                  {meal.portionDesc}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {meal.fedToday ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    Fed at {meal.lastFedTimestamp || 'Today'}
                  </span>
                ) : (
                  <span>Pending feeding</span>
                )}
              </span>

              <button
                type="button"
                onClick={() => {
                  onToggleMealFed(meal.id);
                  playSuccessChime();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  meal.fedToday
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : `${themeConfig.accentClass.btnPrimary}`
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {meal.fedToday ? 'Marked Fed' : 'Mark Fed'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add New Scheduled Meal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Add Meal Reminder
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Meal Label
                  </label>
                  <select
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Evening Snack">Evening Snack</option>
                    <option value="Supplements">Supplements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Food Type
                  </label>
                  <select
                    value={newFoodType}
                    onChange={(e) => setNewFoodType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  >
                    <option value="Dry Kibble">Dry Kibble</option>
                    <option value="Wet Food">Wet Food</option>
                    <option value="Raw Food">Raw Food</option>
                    <option value="Prescription Diet">Prescription Diet</option>
                    <option value="Joint Supplement">Joint Supplement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                    Portion (Grams)
                  </label>
                  <input
                    type="number"
                    required
                    value={newGrams}
                    onChange={(e) => setNewGrams(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-medium mb-1">
                  Feeding Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 1.5 cups dry kibble with bone broth topper"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-semibold shadow-xs ${themeConfig.accentClass.btnPrimary}`}
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
