"use client";

import { useState } from "react";
import { createAccount } from "@/app/actions/accounts";

export function AccountForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createAccount(formData);

    if (res.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Account</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
            Account Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="e.g. Chase Checking"
            />
          </div>
        </div>

        <div>
          <label htmlFor="balance" className="block text-sm font-medium leading-6 text-gray-900">
            Starting Balance
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="balance"
              id="balance"
              step="0.01"
              defaultValue="0.00"
              className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="0.00"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Account"}
        </button>
      </form>
    </div>
  );
}
