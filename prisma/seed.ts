import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({ log: ['info'] });

async function main() {
  console.log('Seeding database...');

  // Create test user
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password_hash: passwordHash,
    },
  });

  console.log(`Created test user: ${user.email} (password: password123)`);

  // Create categories
  const categories = ['Groceries', 'Rent', 'Entertainment', 'Utilities', 'Salary', 'Dining Out'];
  const createdCategories = [];
  
  for (const name of categories) {
    const category = await prisma.category.create({
      data: {
        name,
        user_id: user.id,
      },
    });
    createdCategories.push(category);
  }

  // Create accounts
  const checking = await prisma.account.create({
    data: {
      name: 'Chase Checking',
      balance: 4500.00,
      user_id: user.id,
    },
  });

  const savings = await prisma.account.create({
    data: {
      name: 'High Yield Savings',
      balance: 15000.00,
      user_id: user.id,
    },
  });

  // Generate transactions for this month and last month
  const now = new Date();
  
  const salaryCat = createdCategories.find(c => c.name === 'Salary')!;
  const rentCat = createdCategories.find(c => c.name === 'Rent')!;
  const groceriesCat = createdCategories.find(c => c.name === 'Groceries')!;
  const entertainmentCat = createdCategories.find(c => c.name === 'Entertainment')!;

  const transactions = [
    // This month
    { account_id: checking.id, category_id: salaryCat.id, amount: 5000, date: new Date(now.getFullYear(), now.getMonth(), 1), note: 'Monthly Salary' },
    { account_id: checking.id, category_id: rentCat.id, amount: -1500, date: new Date(now.getFullYear(), now.getMonth(), 2), note: 'Rent payment' },
    { account_id: checking.id, category_id: groceriesCat.id, amount: -120.50, date: new Date(now.getFullYear(), now.getMonth(), 5), note: 'Whole Foods' },
    { account_id: checking.id, category_id: entertainmentCat.id, amount: -45, date: new Date(now.getFullYear(), now.getMonth(), 10), note: 'Movie tickets' },
    { account_id: checking.id, category_id: groceriesCat.id, amount: -85.20, date: new Date(now.getFullYear(), now.getMonth(), 15), note: 'Trader Joes' },
    
    // Last month
    { account_id: checking.id, category_id: salaryCat.id, amount: 5000, date: new Date(now.getFullYear(), now.getMonth() - 1, 1), note: 'Monthly Salary' },
    { account_id: checking.id, category_id: rentCat.id, amount: -1500, date: new Date(now.getFullYear(), now.getMonth() - 1, 2), note: 'Rent payment' },
    { account_id: checking.id, category_id: groceriesCat.id, amount: -250, date: new Date(now.getFullYear(), now.getMonth() - 1, 10), note: 'Groceries' },
    { account_id: checking.id, category_id: entertainmentCat.id, amount: -150, date: new Date(now.getFullYear(), now.getMonth() - 1, 20), note: 'Concert' },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({ data: t });
  }

  console.log('Seeding complete! You can log in with demo@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
