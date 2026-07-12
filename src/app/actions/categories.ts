"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCategory(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const category = await prisma.category.create({
    data: {
      name,
      user_id: session.user.id,
    },
  });

  return category;
}

export async function getCategories() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return prisma.category.findMany({
    where: { user_id: session.user.id },
    orderBy: { name: "asc" },
  });
}
