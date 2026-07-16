"use client";

import { useState } from "react";
import { deleteTransaction } from "@/app/actions/transactions";

export function DeleteTransactionButton({ id, accountId, amount }: { id: string, accountId: string, amount: number }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteTransaction(id, accountId, amount);
    setIsDeleting(false);
    setIsConfirming(false);
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium motion-safe:transition-colors disabled:opacity-50"
        >
          {isDeleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium motion-safe:transition-colors disabled:opacity-50"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium motion-safe:transition-colors"
    >
      Delete
    </button>
  );
}
