import { getTransactions } from "@/app/actions/transactions";
import { getAccounts } from "@/app/actions/accounts";
import { getCategories } from "@/app/actions/categories";
import { TransactionForm } from "@/components/TransactionForm";
import { DeleteTransactionButton } from "@/components/DeleteTransactionButton";
import { CsvImport } from "@/components/CsvImport";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const limit = 50;

  const [{ data: transactions, total }, accounts, categories] = await Promise.all([
    getTransactions(page, limit),
    getAccounts(),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Transactions
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CsvImport accounts={accounts.map(a => ({ id: a.id, name: a.name }))} />
          {transactions.length === 0 ? (
            <div className="text-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 bg-white dark:bg-[#02040a]/50">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new transaction or importing a CSV file above.</p>
            </div>
          ) : (
            <div className="overflow-hidden bg-white dark:bg-[#02040a]/50 shadow-sm ring-1 ring-gray-300 dark:ring-white/10 sm:rounded-xl">
              <ul role="list" className="divide-y divide-gray-200 dark:divide-white/10">
                {transactions.map((tx) => (
                  <li key={tx.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 dark:hover:bg-white/5 sm:px-6 motion-safe:transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-lg mb-2 overflow-hidden">
                    <div className="flex min-w-0 gap-x-4 items-center">
                      <div className={`h-10 w-10 flex-none rounded-full flex items-center justify-center ${tx.amount < 0 ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400'}`}>
                        <span className="font-semibold text-lg">{tx.amount < 0 ? '-' : '+'}</span>
                      </div>
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white truncate">
                          {tx.category.name} <span className="text-gray-400 font-normal">({tx.account.name})</span>
                        </p>
                        <p className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-gray-400">
                          {tx.note || "No note"} • {tx.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-x-4">
                      <div className="flex flex-col items-end">
                        <p className={`text-sm leading-6 font-semibold ${tx.amount < 0 ? 'text-gray-900 dark:text-white' : 'text-green-600 dark:text-green-400'}`}>
                          {formatCurrency(Math.abs(tx.amount))}
                        </p>
                        <DeleteTransactionButton id={tx.id} accountId={tx.account_id} amount={tx.amount} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Link
                      href={page > 1 ? `/transactions?page=${page - 1}` : '#'}
                      className={`relative inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-black/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      Previous
                    </Link>
                    <Link
                      href={page < totalPages ? `/transactions?page=${page + 1}` : '#'}
                      className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-black/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      Next
                    </Link>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        Showing <span className="font-medium dark:text-white">{(page - 1) * limit + 1}</span> to <span className="font-medium dark:text-white">{Math.min(page * limit, total)}</span> of{' '}
                        <span className="font-medium dark:text-white">{total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Link
                          href={page > 1 ? `/transactions?page=${page - 1}` : '#'}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0 ${page <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        <Link
                          href={page < totalPages ? `/transactions?page=${page + 1}` : '#'}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-white/5 focus:z-20 focus:outline-offset-0 ${page >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div>
          <div className="sticky top-6">
            <TransactionForm 
              accounts={accounts.map(a => ({ id: a.id, name: a.name }))}
              initialCategories={categories.map(c => ({ id: c.id, name: c.name }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
