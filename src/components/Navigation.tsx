import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export async function Navigation() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  return (
    <nav className="bg-white/80 dark:bg-[#02040a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard">
                <Logo className="h-10 w-auto text-gray-900 dark:text-white hover:opacity-80 transition-opacity" />
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/accounts"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Accounts
              </Link>
              <Link
                href="/transactions"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Transactions
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{session.user.email}</span>
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
