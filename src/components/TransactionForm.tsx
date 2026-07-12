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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm">Please add an account before creating a transaction.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add Transaction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="account_id" className="block text-sm font-medium leading-6 text-gray-900">Account</label>
            <select
              id="account_id"
              name="account_id"
              required
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium leading-6 text-gray-900">Category</label>
            {isAddingCategory ? (
              <div className="flex mt-2 gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6 px-3"
                  placeholder="New Category"
                />
                <button type="button" onClick={handleAddCategory} className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm">Add</button>
                <button type="button" onClick={() => setIsAddingCategory(false)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm">Cancel</button>
              </div>
            ) : (
              <div className="flex mt-2 gap-2">
                <select
                  id="category_id"
                  name="category_id"
                  required
                  className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setIsAddingCategory(true)} className="text-indigo-600 text-sm whitespace-nowrap px-2">+</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">Amount (Negative for expense)</label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              step="0.01"
              required
              className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="-15.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium leading-6 text-gray-900">Note</label>
          <input
            type="text"
            name="note"
            id="note"
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
            placeholder="Lunch with friends"
          />
        </div>

        <button
          type="submit"
          disabled={loading || isAddingCategory}
          className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 motion-safe:transition-colors"
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}
