import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface BudgetAlertProps {
  used: number;
  budget: number;
  currency: string;
}

export default function BudgetAlert({ used, budget, currency }: BudgetAlertProps) {
  const percent = (used / budget) * 100;
  
  if (percent < 80) return null;

  const isOver = percent >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border flex items-center gap-4 ${
        isOver 
          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' 
          : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400'
      }`}
    >
      <div className={`p-2 rounded-xl ${isOver ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold">
          {isOver ? 'Budget Exceeded!' : 'Budget Warning'}
        </p>
        <p className="text-xs opacity-90">
          You've spent {currency}{used.toLocaleString()} of your {currency}{budget.toLocaleString()} monthly budget.
        </p>
      </div>
    </motion.div>
  );
}
