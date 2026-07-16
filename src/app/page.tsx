import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import { AbyssalLanding } from "@/components/landing-premium/AbyssalLanding";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/dashboard");
  }

  return <AbyssalLanding isSignedIn={!!session} />;
}
