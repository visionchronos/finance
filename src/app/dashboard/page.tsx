import { getDashboardData } from "@/app/actions/dashboard";
import { DashboardCharts } from "@/components/DashboardCharts";
import { BudgetProgress } from "@/components/BudgetProgress";
import { ArrowUpIcon, ArrowDownIcon, WalletIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h2>
        {data.insight && (
          <div className="mt-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start">
            <div className="flex-shrink-0">
              <span className="text-indigo-400 text-xl">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">Insight</h3>
              <div className="mt-1 text-sm text-indigo-700">
                <p>{data.insight}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Balance Card */}
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 motion-safe:transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-indigo-100 rounded-md">
                  <WalletIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Balance</dt>
                  <dd className={`mt-1 text-3xl font-semibold tracking-tight ${data.totalBalance < 0 ? 'text-red-600' : 'text-gray-900'} truncate`}>
                    {formatCurrency(data.totalBalance)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 motion-safe:transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 rounded-md">
                  <ArrowUpIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Income This Month</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 truncate">
                    {formatCurrency(data.incomeThisMonth)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-200 motion-safe:transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-red-100 rounded-md">
                  <ArrowDownIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Spending This Month</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 truncate">
                    {formatCurrency(data.spendingThisMonth)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <DashboardCharts 
            pieChartData={data.pieChartData} 
            lineChartData={data.lineChartData} 
            netWorthData={data.netWorthData}
          />
        </div>
        <div className="lg:col-span-1">
          <BudgetProgress status={data.budgetStatus} />
        </div>
      </div>
    </div>
  );
}
