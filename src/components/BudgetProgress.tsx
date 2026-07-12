import React from "react";
import { formatCurrency } from "@/lib/utils";

type BudgetStatus = {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
};

export function BudgetProgress({ status }: { status: BudgetStatus[] }) {
  if (status.length === 0) {
    return (
      <div className="text-center rounded-xl border-2 border-dashed border-gray-300 p-8">
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No active budgets</h3>
        <p className="mt-1 text-sm text-gray-500">Set up budgets to track your spending limits.</p>
        <div className="mt-4">
          <a href="/budgets" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Set Budgets &rarr;
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Monthly Budget Tracking</h3>
        <a href="/budgets" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Edit
        </a>
      </div>
      <ul className="divide-y divide-gray-100">
        {status.map((item) => {
          const isWarning = item.percentage >= 80 && item.percentage <= 100;
          const isDanger = item.percentage > 100;
          
          let barColor = "bg-green-500";
          if (isWarning) barColor = "bg-amber-500";
          if (isDanger) barColor = "bg-red-500";

          // Cap the visual bar at 100%
          const fillWidth = Math.min(item.percentage, 100);

          return (
            <li key={item.categoryId} className="p-6 motion-safe:transition-all duration-300 hover:bg-gray-50">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.categoryName}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${isDanger ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatCurrency(item.spentAmount)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    / {formatCurrency(item.budgetAmount)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden flex">
                <div 
                  className={`h-2.5 rounded-full motion-safe:transition-all duration-500 ease-out ${barColor}`} 
                  style={{ width: `${fillWidth}%` }}
                ></div>
              </div>
              {item.percentage > 0 && (
                <p className={`text-xs mt-2 text-right font-medium ${isDanger ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-500'}`}>
                  {item.percentage}% used
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
