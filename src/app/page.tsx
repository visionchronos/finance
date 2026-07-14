import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { LandingClient } from "@/components/landing/LandingClient";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Also check if they've seen the intro this session
  const cookieStore = cookies();
  const hasSeenIntro = (await cookieStore).get("has_seen_intro")?.value === "true";

  if (session) {
    redirect("/dashboard");
  }

  return <LandingClient initialSkip={hasSeenIntro} />;
}
