import { getAccounts } from "@/app/actions/accounts";
import { AccountForm } from "@/components/AccountForm";
import { ShareAccountForm } from "@/components/ShareAccountForm";
import { formatCurrency } from "@/lib/utils";

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Accounts
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {accounts.length === 0 ? (
            <div className="text-center rounded-xl border-2 border-dashed border-gray-300 p-12">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No accounts</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new account.</p>
            </div>
          ) : (
            <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-300 sm:rounded-xl">
              <ul role="list" className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <li key={account.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 motion-safe:transition-all duration-300 hover:shadow-sm rounded-lg mb-2 overflow-hidden">
                    <div className="flex min-w-0 gap-x-4 items-center">
                      <div className="h-12 w-12 flex-none rounded-full bg-indigo-50 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-lg">{account.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                          {account.name}
                        </p>
                      </div>
                    </div>
                      <div className="flex shrink-0 items-center gap-x-4">
                        <div className="hidden sm:flex sm:flex-col sm:items-end">
                          <p className={`text-lg leading-6 font-semibold ${account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatCurrency(account.balance)}
                          </p>
                          <ShareAccountForm accountId={account.id} />
                        </div>
                      </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div>
          <div className="sticky top-6">
            <AccountForm />
          </div>
        </div>
      </div>
    </div>
  );
}
