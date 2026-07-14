"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTransaction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const account_id = formData.get("account_id") as string;
  const category_id = formData.get("category_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const note = formData.get("note") as string;
  const date = new Date(formData.get("date") as string);

  if (!account_id || !category_id || isNaN(amount) || !date) {
    return { error: "Missing required fields" };
  }

  // Ensure the account belongs to the user or is shared with EDITOR role
  const account = await prisma.account.findFirst({
    where: { 
      id: account_id,
      OR: [
        { user_id: session.user.id },
        { shares: { some: { shared_with_user_id: session.user.id, role: "EDITOR" } } }
      ]
    },
  });

  if (!account) return { error: "Invalid account" };

  try {
    // Transaction runs in a Prisma interactive transaction to update the account balance
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          account_id,
          category_id,
          amount,
          note,
          date,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: account_id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });
    });

    revalidatePath("/transactions");
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create transaction" };
  }
}

export async function getTransactions(page: number = 1, limit: number = 50, categoryId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { data: [], total: 0 };

  const whereClause: any = {
    account: {
      OR: [
        { user_id: session.user.id },
        { shares: { some: { shared_with_user_id: session.user.id } } }
      ]
    },
  };

  if (categoryId) {
    whereClause.category_id = categoryId;
  }

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: true,
        category: true,
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({
      where: whereClause,
    })
  ]);

  return { data, total };
}

export async function deleteTransaction(id: string, account_id: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Ensure transaction belongs to user's account or shared with EDITOR role
  const account = await prisma.account.findFirst({
    where: { 
      id: account_id,
      OR: [
        { user_id: session.user.id },
        { shares: { some: { shared_with_user_id: session.user.id, role: "EDITOR" } } }
      ]
    },
  });

  if (!account) return { error: "Invalid account" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({
        where: { id },
      });

      await tx.account.update({
        where: { id: account_id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });
    });

    revalidatePath("/transactions");
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete transaction" };
  }
}

export async function importCsv(account_id: string, rows: { date: string, amount: number, category: string, note: string }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Ensure account belongs to user or is shared with EDITOR role
  const account = await prisma.account.findFirst({
    where: { 
      id: account_id,
      OR: [
        { user_id: session.user.id },
        { shares: { some: { shared_with_user_id: session.user.id, role: "EDITOR" } } }
      ]
    },
  });

  if (!account) return { error: "Invalid account or missing permissions" };

  const rowErrors: string[] = [];
  const validRows: { date: string; amount: number; category: string; note: string; dateObj: Date }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const dateObj = new Date(row.date);
    if (!row.date || isNaN(dateObj.getTime())) {
      rowErrors.push(`Row ${i + 1}: Invalid date`);
      continue;
    }
    if (isNaN(row.amount)) {
      rowErrors.push(`Row ${i + 1}: Invalid amount`);
      continue;
    }
    validRows.push({ ...row, dateObj });
  }

  if (validRows.length === 0) {
    return { error: "No valid rows to import", rowErrors };
  }

  try {
    let totalAmount = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of validRows) {
        // Find or create category
        let category = await tx.category.findFirst({
          where: { name: row.category, user_id: session.user.id },
        });

        if (!category) {
          category = await tx.category.create({
            data: { name: row.category, user_id: session.user.id },
          });
        }

        // Create transaction
        await tx.transaction.create({
          data: {
            account_id,
            category_id: category.id,
            amount: row.amount,
            date: row.dateObj,
            note: row.note,
          },
        });

        totalAmount += row.amount;
      }

      // Update account balance
      await tx.account.update({
        where: { id: account_id },
        data: {
          balance: {
            increment: totalAmount,
          },
        },
      });
    });

    revalidatePath("/transactions");
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { success: true, rowErrors: rowErrors.length > 0 ? rowErrors : undefined, importedCount: validRows.length };
  } catch (error) {
    console.error(error);
    return { error: "Failed to import transactions" };
  }
}

