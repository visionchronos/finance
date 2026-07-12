import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
        Take Control of Your <span className="text-indigo-600">Finances</span>
      </h1>
      <p className="text-lg text-gray-600 mb-10 max-w-2xl">
        A personal finance tracker built to demonstrate real end-to-end engineering. Track accounts, categorize spending, and visualize your financial health in one place.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 motion-safe:transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 motion-safe:transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
