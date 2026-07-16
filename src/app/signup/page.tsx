"use client";

import { useState } from "react";
import { signUp } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await signUp(formData);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#02040a] px-4 py-12 sm:px-6 lg:px-8 overflow-hidden transition-colors">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8 bg-white/60 dark:bg-black/40 backdrop-blur-2xl p-10 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-gray-100/50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 mb-2">
            <Logo className="h-12 w-auto text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Join the new financial standard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <label className="sr-only" htmlFor="email">Email address</label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-xl border-0 bg-white dark:bg-white/5 py-3 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all shadow-sm dark:shadow-none"
                placeholder="Email address"
              />
            </div>
            
            <div className="relative">
              <label className="sr-only" htmlFor="password">Password</label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-xl border-0 bg-white dark:bg-white/5 py-3 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all shadow-sm dark:shadow-none"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Sign up"}
              {!isLoading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
