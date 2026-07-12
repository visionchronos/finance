import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBudgetStatus } from '@/app/actions/budgets';
import { formatCurrency } from '@/lib/utils';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
  // 1. Authenticate the cron job request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev_secret'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Fetch all users
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      }
    });

    // We will use a mock transport for demonstration purposes.
    // In production, configure SMTP settings or use a service like Resend.
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows'
    });

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    for (const user of users) {
      if (user.accounts.length === 0) continue;
      
      const accountIds = user.accounts.map(a => a.id);

      const recentTransactions = await prisma.transaction.findMany({
        where: {
          account_id: { in: accountIds },
          date: { gte: startOfWeek, lte: now }
        }
      });

      if (recentTransactions.length === 0) continue; // No activity this week

      let expenses = 0;
      let income = 0;

      recentTransactions.forEach(tx => {
        if (tx.amount < 0) {
          expenses += Math.abs(tx.amount);
        } else {
          income += tx.amount;
        }
      });

      // Get budget status for current month
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const budgetStatus = await getBudgetStatus(user.id, currentMonth, currentYear);
      
      const alerts = budgetStatus.filter(b => b.percentage >= 80);
      let alertsHtml = '';
      if (alerts.length > 0) {
        alertsHtml = `
          <h3 style="color: #d97706;">⚠️ Budget Alerts</h3>
          <ul>
            ${alerts.map(a => `
              <li><strong>${a.categoryName}</strong> is at ${a.percentage}% of your ${formatCurrency(a.budgetAmount)} limit.</li>
            `).join('')}
          </ul>
        `;
      }

      // 3. Construct email HTML
      const html = `
        <h2>Weekly Finance Digest</h2>
        <p>Hi ${user.email}, here is your spending summary for the last 7 days:</p>
        <ul>
          <li><strong>Income:</strong> ${formatCurrency(income)}</li>
          <li><strong>Expenses:</strong> ${formatCurrency(expenses)}</li>
        </ul>
        ${alertsHtml}
        <p>Log in to your dashboard to see more details.</p>
      `;

      // 4. Send email
      const info = await transporter.sendMail({
        from: '"Finance Tracker" <noreply@financetracker.local>',
        to: user.email,
        subject: 'Your Weekly Finance Digest',
        html,
      });

      // In stream transport mode, we can log the message generated
      console.log(`Mock Email sent to ${user.email}`);
      console.log(info.message.toString());
    }

    return NextResponse.json({ success: true, message: 'Digests sent successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process digests' }, { status: 500 });
  }
}
