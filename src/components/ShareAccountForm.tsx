"use client";

import { useState } from "react";
import { shareAccount } from "@/app/actions/accounts";

export function ShareAccountForm({ accountId }: { accountId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    formData.append("account_id", accountId);
    
    const res = await shareAccount(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setIsOpen(false), 2000);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        Share
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Share Account</h4>
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <div className="flex-1">
          <input
            type="email"
            name="email"
            required
            placeholder="User email"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
          />
        </div>
        <div>
          <select
            name="role"
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-white"
          >
            <option value="VIEWER">Viewer</option>
            <option value="EDITOR">Editor</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "..." : "Invite"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">Account shared successfully!</p>}
    </div>
  );
}
