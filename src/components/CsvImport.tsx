"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importCsv } from "@/app/actions/transactions";

export function CsvImport({ accounts }: { accounts: { id: string, name: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rowErrors, setRowErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    if (!accountId) {
      setError("Please select an account first");
      setLoading(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data.map((row: any) => ({
            date: row.Date || row.date,
            amount: parseFloat(row.Amount || row.amount),
            category: row.Category || row.category || "Uncategorized",
            note: row.Note || row.note || "",
          }));

          const res = await importCsv(accountId, rows);
          if (res.error) {
            setError(res.error);
            if (res.rowErrors) setRowErrors(res.rowErrors);
          } else {
            setSuccess(true);
            if (res.rowErrors && res.rowErrors.length > 0) {
              setRowErrors(res.rowErrors);
            }
            setTimeout(() => {
              setSuccess(false);
              setRowErrors([]);
            }, 8000); // Give user more time to read partial errors
          }
        } catch (err: any) {
          setError(err.message || "Failed to parse CSV");
        }
        setLoading(false);
        // Reset file input
        e.target.value = '';
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  };

  if (accounts.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Import Transactions (CSV)</h3>
      <div className="flex items-center gap-4">
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
        
        <div>
          <label className="cursor-pointer inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {loading ? "Importing..." : "Upload CSV"}
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>
        </div>
      </div>
      
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700 font-medium">Transactions imported successfully!</p>
        </div>
      )}

      {rowErrors.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800 font-medium mb-1">Some rows were skipped:</p>
          <ul className="text-xs text-yellow-700 list-disc list-inside max-h-32 overflow-y-auto">
            {rowErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Expected CSV headers: Date, Amount, Category (optional), Note (optional)
      </p>
    </div>
  );
}
