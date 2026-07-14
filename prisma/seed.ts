import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with sample data...');

  // 1. Create a dummy user
  const email = 'demo@example.com';
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    const password_hash = await bcrypt.hash('password123', 10);
    user = await prisma.user.create({
      data: {
        email,
        password_hash,
      },
    });
    console.log(`Created user: ${user.email} (password: password123)`);
  } else {
    console.log(`User ${user.email} already exists.`);
  }

  // 2. Create Categories
  const categoryNames = ['Groceries', 'Rent', 'Salary', 'Entertainment', 'Utilities', 'Dining Out'];
  const categories: Record<string, any> = {};
  
  for (const name of categoryNames) {
    let cat = await prisma.category.findFirst({
      where: { user_id: user.id, name }
    });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name, user_id: user.id }
      });
    }
    categories[name] = cat;
  }
  console.log('Created categories.');

  // 3. Create Accounts
  let checkingAccount = await prisma.account.findFirst({
    where: { user_id: user.id, name: 'Checking' }
  });
  if (!checkingAccount) {
    checkingAccount = await prisma.account.create({
      data: { name: 'Checking', balance: 5400.50, user_id: user.id }
    });
  }

  let savingsAccount = await prisma.account.findFirst({
    where: { user_id: user.id, name: 'Savings' }
  });
  if (!savingsAccount) {
    savingsAccount = await prisma.account.create({
      data: { name: 'Savings', balance: 12000.00, user_id: user.id }
    });
  }
  console.log('Created accounts.');

  // 4. Create Transactions (over the last 3 months)
  const now = new Date();
  const transactions = [];

  // Helper to get a date n days ago
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  const sampleTx = [
    // Income
    { amount: 4500, category: 'Salary', accountId: checkingAccount.id, daysAgo: 2, note: 'Monthly Salary' },
    { amount: 4500, category: 'Salary', accountId: checkingAccount.id, daysAgo: 32, note: 'Monthly Salary' },
    { amount: 4500, category: 'Salary', accountId: checkingAccount.id, daysAgo: 62, note: 'Monthly Salary' },
    
    // Expenses
    { amount: -1500, category: 'Rent', accountId: checkingAccount.id, daysAgo: 1, note: 'Rent payment' },
    { amount: -1500, category: 'Rent', accountId: checkingAccount.id, daysAgo: 31, note: 'Rent payment' },
    { amount: -1500, category: 'Rent', accountId: checkingAccount.id, daysAgo: 61, note: 'Rent payment' },
    
    { amount: -120.50, category: 'Groceries', accountId: checkingAccount.id, daysAgo: 3, note: 'Whole Foods' },
    { amount: -85.20, category: 'Groceries', accountId: checkingAccount.id, daysAgo: 10, note: 'Trader Joes' },
    { amount: -210.00, category: 'Groceries', accountId: checkingAccount.id, daysAgo: 17, note: 'Costco' },
    { amount: -95.00, category: 'Groceries', accountId: checkingAccount.id, daysAgo: 35, note: 'Whole Foods' },
    { amount: -130.00, category: 'Groceries', accountId: checkingAccount.id, daysAgo: 45, note: 'Costco' },

    { amount: -45.00, category: 'Dining Out', accountId: checkingAccount.id, daysAgo: 5, note: 'Dinner with friends' },
    { amount: -25.00, category: 'Dining Out', accountId: checkingAccount.id, daysAgo: 12, note: 'Lunch' },
    { amount: -65.00, category: 'Dining Out', accountId: checkingAccount.id, daysAgo: 25, note: 'Date night' },
    
    { amount: -150.00, category: 'Utilities', accountId: checkingAccount.id, daysAgo: 15, note: 'Electricity Bill' },
    { amount: -60.00, category: 'Utilities', accountId: checkingAccount.id, daysAgo: 16, note: 'Water Bill' },
    { amount: -140.00, category: 'Utilities', accountId: checkingAccount.id, daysAgo: 45, note: 'Electricity Bill' },

    { amount: -200.00, category: 'Entertainment', accountId: checkingAccount.id, daysAgo: 8, note: 'Concert Tickets' },
    { amount: -15.99, category: 'Entertainment', accountId: checkingAccount.id, daysAgo: 14, note: 'Netflix' },
    { amount: -15.99, category: 'Entertainment', accountId: checkingAccount.id, daysAgo: 44, note: 'Netflix' },
    { amount: -60.00, category: 'Entertainment', accountId: checkingAccount.id, daysAgo: 50, note: 'Video Game' },
    
    // Transfer to savings
    { amount: -500, category: 'Utilities', accountId: checkingAccount.id, daysAgo: 4, note: 'Misc Transfer' }, // just a negative
    { amount: 500, category: 'Salary', accountId: savingsAccount.id, daysAgo: 4, note: 'Misc Transfer In' },
  ];

  for (const t of sampleTx) {
    await prisma.transaction.create({
      data: {
        account_id: t.accountId,
        category_id: categories[t.category].id,
        amount: t.amount,
        note: t.note,
        date: daysAgo(t.daysAgo),
      }
    });
  }
  console.log(`Created ${sampleTx.length} transactions.`);

  // 5. Set Budgets for current month
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await prisma.budget.upsert({
    where: {
      user_id_category_id_month_year: {
        user_id: user.id,
        category_id: categories['Groceries'].id,
        month: currentMonth,
        year: currentYear
      }
    },
    update: { amount: 500 },
    create: {
      user_id: user.id,
      category_id: categories['Groceries'].id,
      amount: 500,
      month: currentMonth,
      year: currentYear
    }
  });

  await prisma.budget.upsert({
    where: {
      user_id_category_id_month_year: {
        user_id: user.id,
        category_id: categories['Dining Out'].id,
        month: currentMonth,
        year: currentYear
      }
    },
    update: { amount: 200 },
    create: {
      user_id: user.id,
      category_id: categories['Dining Out'].id,
      amount: 200,
      month: currentMonth,
      year: currentYear
    }
  });
  
  await prisma.budget.upsert({
    where: {
      user_id_category_id_month_year: {
        user_id: user.id,
        category_id: categories['Entertainment'].id,
        month: currentMonth,
        year: currentYear
      }
    },
    update: { amount: 100 },
    create: {
      user_id: user.id,
      category_id: categories['Entertainment'].id,
      amount: 100,
      month: currentMonth,
      year: currentYear
    }
  });
  console.log('Created budgets for the current month.');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
