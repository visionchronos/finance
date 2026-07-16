"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBudgetStatus } from "./budgets";

export async function getDashboardData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const accounts = await prisma.account.findMany({
    where: { 
      OR: [
        { user_id: userId },
        { shares: { some: { shared_with_user_id: userId } } }
      ]
    },
    select: { id: true, balance: true },
  });
  const accountIds = accounts.map(a => a.id);
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  // This month's bounds
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Last month's bounds (for hero feature insight)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Transactions this month
  const thisMonthTransactions = await prisma.transaction.findMany({
    where: {
      account_id: { in: accountIds },
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    include: { category: true, account: true },
  });

  let spendingThisMonth = 0;
  let incomeThisMonth = 0;
  const categoryNet: Record<string, number> = {};
  const spendingByDate: Record<string, number> = {};

  // First pass: Aggregate net amount per category
  thisMonthTransactions.forEach((tx) => {
    const catName = tx.category.name;
    categoryNet[catName] = (categoryNet[catName] || 0) + tx.amount;
    
    // For the daily trend line, we'll still just track absolute expenses
    // so the chart doesn't dip below zero and look confusing
    if (tx.amount < 0) {
      const dateStr = tx.date.toISOString().split('T')[0];
      spendingByDate[dateStr] = (spendingByDate[dateStr] || 0) + Math.abs(tx.amount);
    }
  });

  // Second pass: Categorize net sums into Income vs Spending
  const pieChartData: { name: string, value: number }[] = [];
  
  Object.entries(categoryNet).forEach(([name, netAmount]) => {
    if (netAmount < 0) {
      const expense = Math.abs(netAmount);
      spendingThisMonth += expense;
      pieChartData.push({ name, value: expense });
    } else if (netAmount > 0) {
      incomeThisMonth += netAmount;
    }
  });

  pieChartData.sort((a, b) => b.value - a.value);

  const lineChartData = Object.entries(spendingByDate)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Hero feature: Insight callout - compare spending
  const lastMonthTransactions = await prisma.transaction.findMany({
    where: {
      account_id: { in: accountIds },
      date: { gte: startOfLastMonth, lte: endOfLastMonth },
      amount: { lt: 0 },
    },
  });

  const spendingLastMonth = lastMonthTransactions.reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  
  let insight = null;
  if (spendingLastMonth > 0) {
    const diff = spendingThisMonth - spendingLastMonth;
    const percentChange = Math.round((diff / spendingLastMonth) * 100);
    if (percentChange > 0) {
      insight = `You spent ${percentChange}% more this month compared to last month.`;
    } else {
      insight = `Great job! You spent ${Math.abs(percentChange)}% less this month compared to last month.`;
    }
  } else if (spendingThisMonth > 0) {
    insight = "This is your first month of tracking! Keep it up.";
  }

  // Feature: Net Worth Chart
  const allTransactions = await prisma.transaction.findMany({
    where: { account_id: { in: accountIds } },
    orderBy: { date: 'desc' }
  });

  const txByDate: Record<string, number> = {};
  for (const tx of allTransactions) {
    const d = tx.date.toISOString().split('T')[0];
    txByDate[d] = (txByDate[d] || 0) + tx.amount;
  }

  const netWorthData: { date: string, amount: number }[] = [];
  let runningBalance = totalBalance;
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    netWorthData.unshift({ date: dateStr, amount: runningBalance });
    
    if (txByDate[dateStr]) {
      runningBalance -= txByDate[dateStr];
    }
  }

  const budgetStatus = await getBudgetStatus(userId, now.getMonth() + 1, now.getFullYear());

  // Feature: Sankey Flow Data
  const nodesMap = new Map<string, { id: string, name: string, type: 'income' | 'account' | 'expense' }>();
  const linksMap = new Map<string, { source: string, target: string, value: number }>();

  thisMonthTransactions.forEach(tx => {
    if (tx.amount === 0) return;

    const accountId = `account_${tx.account_id}`;
    if (!nodesMap.has(accountId)) {
      nodesMap.set(accountId, { id: accountId, name: tx.account.name, type: 'account' });
    }

    if (tx.amount > 0) {
      const incId = `income_${tx.category_id}`;
      if (!nodesMap.has(incId)) nodesMap.set(incId, { id: incId, name: tx.category.name, type: 'income' });
      
      const linkId = `${incId}->${accountId}`;
      const existingLink = linksMap.get(linkId);
      if (existingLink) {
        existingLink.value += tx.amount;
      } else {
        linksMap.set(linkId, { source: incId, target: accountId, value: tx.amount });
      }
    } else if (tx.amount < 0) {
      const expId = `expense_${tx.category_id}`;
      if (!nodesMap.has(expId)) nodesMap.set(expId, { id: expId, name: tx.category.name, type: 'expense' });
      
      const linkId = `${accountId}->${expId}`;
      const existingLink = linksMap.get(linkId);
      const absVal = Math.abs(tx.amount);
      if (existingLink) {
        existingLink.value += absVal;
      } else {
        linksMap.set(linkId, { source: accountId, target: expId, value: absVal });
      }
    }
  });

  const sankeyData = {
    nodes: Array.from(nodesMap.values()),
    links: Array.from(linksMap.values())
  };

  return {
    totalBalance,
    incomeThisMonth,
    spendingThisMonth,
    pieChartData,
    lineChartData,
    netWorthData,
    insight,
    budgetStatus,
    sankeyData,
  };
}
