import { getTransactions } from "@/app/actions/transactions";
import { formatCurrency } from "@/lib/utils";
import { getCategoryColor } from "@/lib/colors";
import Link from "next/link";

export async function RecentTransactions({ categoryId }: { categoryId?: string }) {
  const { data: transactions } = await getTransactions(1, 15, categoryId);

  return (
    <div id="recent-transactions" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8 scroll-mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {categoryId ? "Filtered Transactions" : "Recent Transactions"}
        </h3>
        {categoryId && (
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Clear Filter
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-500">
          No transactions found for this filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                    {tx.note || "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span 
                      className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset"
                      style={{ 
                        color: getCategoryColor(tx.category.name), 
                        backgroundColor: `${getCategoryColor(tx.category.name)}15`,
                        borderColor: `${getCategoryColor(tx.category.name)}30`
                      }}
                    >
                      {tx.category.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {tx.account.name}
                  </td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm text-right font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <Link href="/transactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          View all transactions →
        </Link>
      </div>
    </div>
  );
}
