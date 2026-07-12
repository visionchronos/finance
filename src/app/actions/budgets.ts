"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBudgetStatus(userId: string, month: number, year: number) {
  // 1. Fetch budgets for the user for this month
  const budgets = await prisma.budget.findMany({
    where: { user_id: userId, month, year },
    include: { category: true },
  });

  if (budgets.length === 0) return [];

  const budgetedCategoryIds = budgets.map(b => b.category_id);

  // 2. Fetch all accounts the user has access to (owned + shared)
  const accounts = await prisma.account.findMany({
    where: { 
      OR: [
        { user_id: userId },
        { shares: { some: { shared_with_user_id: userId } } }
      ]
    },
    select: { id: true },
  });
  
  const accountIds = accounts.map(a => a.id);

  // 3. Define date boundaries for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // 4. Fetch outgoing transactions for those categories
  const transactions = await prisma.transaction.findMany({
    where: {
      account_id: { in: accountIds },
      category_id: { in: budgetedCategoryIds },
      amount: { lt: 0 },
      date: { gte: startDate, lte: endDate },
    },
  });

  // Calculate spent per category
  const spentByCategory: Record<string, number> = {};
  for (const tx of transactions) {
    spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] || 0) + Math.abs(tx.amount);
  }

  // 5. Build response array
  return budgets.map((budget) => {
    const spentAmount = spentByCategory[budget.category_id] || 0;
    const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
    
    return {
      categoryId: budget.category_id,
      categoryName: budget.category.name,
      budgetAmount: budget.amount,
      spentAmount,
      percentage: Math.round(percentage),
    };
  }).sort((a, b) => b.percentage - a.percentage);
}

export async function getBudgetsForMonth(month: number, year: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Try to fetch current month's budgets
  const budgets = await prisma.budget.findMany({
    where: { user_id: userId, month, year },
  });

  if (budgets.length > 0) {
    return budgets;
  }

  // If none exist, fetch last month's as fallback
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  const prevBudgets = await prisma.budget.findMany({
    where: { user_id: userId, month: prevMonth, year: prevYear },
  });

  return prevBudgets.map(b => ({
    ...b,
    id: "", // Clear ID since these haven't been saved for the current month yet
    month,
    year
  }));
}

export async function saveBudgets(budgets: { category_id: string, amount: number, month: number, year: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      for (const budget of budgets) {
        // Upsert budget per category for the month
        await tx.budget.upsert({
          where: {
            user_id_category_id_month_year: {
              user_id: userId,
              category_id: budget.category_id,
              month: budget.month,
              year: budget.year,
            },
          },
          update: { amount: budget.amount },
          create: {
            user_id: userId,
            category_id: budget.category_id,
            amount: budget.amount,
            month: budget.month,
            year: budget.year,
          },
        });
      }
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save budgets" };
  }
}
