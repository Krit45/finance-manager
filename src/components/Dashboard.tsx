import React, { useMemo } from 'react';
import { useApp } from '../App';
import { CATEGORIES } from '../types';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  ArrowUpRight, ArrowDownRight, AlertCircle, 
  PieChart as PieChartIcon, BarChart3 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

import BudgetAlert from './BudgetAlert';

export default function Dashboard() {
  const { transactions, profile } = useApp();
  const currency = profile?.currency || '$';

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const currentMonthTxs = transactions.filter(tx => 
      isWithinInterval(parseISO(tx.date), { start: currentMonthStart, end: currentMonthEnd })
    );

    const totalIncome = currentMonthTxs
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpenses = currentMonthTxs
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const balance = totalIncome - totalExpenses;
    const budgetUsed = profile?.monthlyBudget ? (totalExpenses / profile.monthlyBudget) * 100 : 0;

    return { totalIncome, totalExpenses, balance, budgetUsed };
  }, [transactions, profile]);

  const chartData = useMemo(() => {
    // Monthly spending (last 6 months)
    const months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthTxs = transactions.filter(tx => 
        isWithinInterval(parseISO(tx.date), { start, end })
      );

      return {
        name: format(date, 'MMM'),
        income: monthTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
        expense: monthTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
      };
    });

    // Category distribution (current month)
    const categoryData = CATEGORIES
      .filter(c => c.type === 'expense')
      .map(cat => {
        const amount = transactions
          .filter(tx => tx.category === cat.id && tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);
        return { name: cat.name, value: amount, color: cat.color.replace('bg-', '#') };
      })
      .filter(d => d.value > 0);

    return { months, categoryData };
  }, [transactions]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Welcome back, {profile?.displayName}</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Live Updates</span>
        </div>
      </header>

      {/* Summary Cards */}
      <BudgetAlert 
        used={stats.totalExpenses} 
        budget={profile?.monthlyBudget || 1000} 
        currency={currency} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Balance" 
          amount={stats.balance} 
          icon={Wallet} 
          color="emerald" 
          currency={currency}
          trend={stats.balance >= 0 ? 'up' : 'down'}
        />
        <SummaryCard 
          title="Monthly Income" 
          amount={stats.totalIncome} 
          icon={ArrowUpRight} 
          color="blue" 
          currency={currency}
        />
        <SummaryCard 
          title="Monthly Expenses" 
          amount={stats.totalExpenses} 
          icon={ArrowDownRight} 
          color="red" 
          currency={currency}
        />
        <SummaryCard 
          title="Budget Used" 
          amount={stats.budgetUsed} 
          icon={AlertCircle} 
          color="orange" 
          isPercent 
          currency={currency}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-bold">Monthly Trends</h2>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.months}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <PieChartIcon className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold">Category Distribution</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, amount, icon: Icon, color, isPercent = false, currency, trend }: any) {
  const colorClasses: any = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
          )}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend === 'up' ? '+12%' : '-5%'}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <h3 className="text-2xl font-bold mt-1">
        {isPercent ? `${amount.toFixed(1)}%` : `${currency}${amount.toLocaleString()}`}
      </h3>
    </div>
  );
}

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
