"use client";

import { useState } from "react";
import { createTransaction } from "@/app/actions/transactions";
import { createCategory } from "@/app/actions/categories";
import { useRouter } from "next/navigation";

type Account = { id: string; name: string };
type Category = { id: string; name: string };

export function TransactionForm({ accounts, initialCategories }: { accounts: Account[], initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    try {
      const cat = await createCategory(newCategoryName);
      setCategories([...categories, cat]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createTransaction(formData);

    if (res.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#02040a]/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Please add an account before creating a transaction.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#02040a]/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Add Transaction</h3>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="account_id" className="block text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">Account</label>
            <select
              id="account_id"
              name="account_id"
              required
              className="mt-2 block w-full rounded-lg border-0 py-3 pl-4 pr-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-white/10 focus:ring-2 focus:ring-indigo-600 text-lg leading-6 bg-white dark:bg-black/50"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category_id" className="block text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">Category</label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Used for budgets & charts</p>
            {isAddingCategory ? (
              <div className="flex gap-3 w-full">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="block flex-1 rounded-lg border-0 py-3 text-gray-900 dark:text-white bg-white dark:bg-black/50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 text-lg leading-6 px-4"
                  placeholder="e.g. Travel, Gym, etc."
                  autoFocus
                />
                <button type="button" onClick={handleAddCategory} className="bg-indigo-600 text-white px-5 py-3 rounded-lg text-lg hover:bg-indigo-500 transition-colors whitespace-nowrap">Add</button>
                <button type="button" onClick={() => setIsAddingCategory(false)} className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-lg text-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors whitespace-nowrap">Cancel</button>
              </div>
            ) : (
              <select
                id="category_id"
                name="category_id"
                required
                className="block w-full rounded-lg border-0 py-3 pl-4 pr-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-white/10 focus:ring-2 focus:ring-indigo-600 text-lg leading-6 bg-white dark:bg-black/50"
                onChange={(e) => {
                  if (e.target.value === "NEW_CATEGORY") {
                    e.target.value = ""; // Reset select
                    setIsAddingCategory(true);
                  }
                }}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
                <option disabled>──────────</option>
                <option value="NEW_CATEGORY">+ Create New Category</option>
              </select>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">Amount (Negative for expense)</label>
          <div className="relative mt-2 rounded-lg shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="text-gray-500 dark:text-gray-400 text-lg">₹</span>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              step="0.01"
              required
              className="block w-full rounded-lg border-0 py-3 pl-9 text-gray-900 dark:text-white bg-white dark:bg-black/50 ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-lg leading-6 px-4"
              placeholder="-15.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="mt-2 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white bg-white dark:bg-black/50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-lg leading-6 px-4"
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">Note</label>
          <input
            type="text"
            name="note"
            id="note"
            className="mt-2 block w-full rounded-lg border-0 py-3 text-gray-900 dark:text-white bg-white dark:bg-black/50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-lg leading-6 px-4"
            placeholder="Lunch with friends"
          />
        </div>

        <button
          type="submit"
          disabled={loading || isAddingCategory}
          className="w-full rounded-lg bg-indigo-600 px-4 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 motion-safe:transition-colors mt-6"
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}
