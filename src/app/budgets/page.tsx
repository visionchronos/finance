import { getBudgetsForMonth } from "@/app/actions/budgets";
import { getCategories } from "@/app/actions/categories";
import { BudgetForm } from "@/components/BudgetForm";

export default async function BudgetsPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  const [categories, initialBudgets] = await Promise.all([
    getCategories(),
    getBudgetsForMonth(currentMonth, currentYear)
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Monthly Budgets
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Set spending limits for your categories. We&apos;ll automatically pull in last month&apos;s budgets if you haven&apos;t set them for this month yet.
          </p>
        </div>
      </div>

      <BudgetForm 
        categories={categories.map(c => ({ id: c.id, name: c.name }))} 
        initialBudgets={initialBudgets}
        month={currentMonth}
        year={currentYear}
      />
    </div>
  );
}
