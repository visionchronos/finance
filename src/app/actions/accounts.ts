"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const initialBalance = parseFloat(formData.get("balance") as string) || 0;

  if (!name) {
    return { error: "Account name is required" };
  }

  try {
    await prisma.account.create({
      data: {
        name,
        balance: initialBalance,
        user_id: session.user.id,
      },
    });

    revalidatePath("/accounts");
    return { success: true };
  } catch (error: any) {
    console.error("Account creation error:", error);
    return { error: error.message || "Failed to create account" };
  }
}

export async function getAccounts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return prisma.account.findMany({
    where: {
      OR: [
        { user_id: session.user.id },
        { shares: { some: { shared_with_user_id: session.user.id } } }
      ]
    },
    include: {
      user: { select: { email: true } },
    },
    orderBy: { created_at: "desc" },
  });
}

export async function shareAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const account_id = formData.get("account_id") as string;
  const email = formData.get("email") as string;
  const role = (formData.get("role") as string) || "VIEWER";

  if (!account_id || !email) return { error: "Missing required fields" };

  // Ensure account belongs to user (only owners can share)
  const account = await prisma.account.findFirst({
    where: { id: account_id, user_id: session.user.id },
  });

  if (!account) return { error: "Account not found or not owned by you" };

  const targetUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!targetUser) return { error: "User with this email not found" };
  if (targetUser.id === session.user.id) return { error: "Cannot share with yourself" };

  try {
    await prisma.accountShare.upsert({
      where: {
        account_id_shared_with_user_id: {
          account_id,
          shared_with_user_id: targetUser.id,
        },
      },
      update: { role },
      create: {
        account_id,
        shared_with_user_id: targetUser.id,
        role,
      },
    });

    revalidatePath("/accounts");
    return { success: true };
  } catch (error) {
    return { error: "Failed to share account" };
  }
}
