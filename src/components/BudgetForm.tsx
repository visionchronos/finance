"use client";

import { useState } from "react";
import { saveBudgets } from "@/app/actions/budgets";

type Category = { id: string; name: string };
type Budget = { category_id: string; amount: number; month: number; year: number };

export function BudgetForm({
  categories,
  initialBudgets,
  month,
  year
}: {
  categories: Category[];
  initialBudgets: Budget[];
  month: number;
  year: number;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Initialize state with existing budgets, or 0 if none exist for a category
  const [budgets, setBudgets] = useState<Record<string, number>>(() => {
    const initialState: Record<string, number> = {};
    categories.forEach(cat => {
      const existing = initialBudgets.find(b => b.category_id === cat.id);
      initialState[cat.id] = existing?.amount || 0;
    });
    return initialState;
  });

  const handleChange = (categoryId: string, amount: string) => {
    const val = parseFloat(amount);
    setBudgets(prev => ({ ...prev, [categoryId]: isNaN(val) ? 0 : val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    // Convert to array format expected by server action, filtering out 0s if they never had a budget
    // Actually, setting to 0 could mean "remove budget", but for simplicity we'll just save whatever is there.
    const budgetsToSave = Object.entries(budgets)
      .filter(([_, amount]) => amount > 0)
      .map(([categoryId, amount]) => ({
        category_id: categoryId,
        amount,
        month,
        year
      }));

    const res = await saveBudgets(budgetsToSave);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else if (res.error) {
      setError(res.error);
    } else {
      setError("Failed to save budgets");
    }
    setLoading(false);
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#02040a]/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Budgets for {monthName} {year}</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
            <label htmlFor={`budget-${category.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
              {category.name}
            </label>
            <div className="relative rounded-md shadow-sm w-32">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id={`budget-${category.id}`}
                min="0"
                step="0.01"
                value={budgets[category.id] || ""}
                onChange={(e) => handleChange(category.id, e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-3 text-gray-900 dark:text-white bg-white dark:bg-black/50 ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 motion-safe:transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-4">
        {success && <span className="text-sm text-green-600 dark:text-green-400 font-medium">Saved successfully!</span>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 motion-safe:transition-colors"
        >
          {loading ? "Saving..." : "Save Budgets"}
        </button>
      </div>
    </form>
  );
}
