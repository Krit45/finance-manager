import React, { useState } from 'react';
import { useApp } from '../App';
import { CATEGORIES, TransactionType } from '../types';
import { db, collection, addDoc, handleFirestoreError, OperationType } from '../firebase';
import { 
  Plus, Minus, Calendar, Tag, FileText, 
  ArrowRight, Loader2, CheckCircle2 
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as TransactionType,
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    isRecurring: false,
  });

  const filteredCategories = CATEGORIES.filter(c => 
    c.type === formData.type || c.type === 'both'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category || !formData.amount) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        note: formData.note,
        isRecurring: formData.isRecurring,
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 1500);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'transactions');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="p-4 bg-emerald-500 rounded-full"
        >
          <CheckCircle2 className="h-12 w-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold">Transaction Added!</h2>
        <p className="text-zinc-500">Your financial record has been updated.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Entry</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Record your income or expenses to stay on track.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Type Toggle */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200",
              formData.type === 'expense' 
                ? "bg-white dark:bg-zinc-700 text-red-500 shadow-sm" 
                : "text-zinc-500"
            )}
          >
            <Minus className="h-4 w-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200",
              formData.type === 'income' 
                ? "bg-white dark:bg-zinc-700 text-emerald-500 shadow-sm" 
                : "text-zinc-500"
            )}
          >
            <Plus className="h-4 w-4" />
            Income
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Amount
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
            <Tag className="h-4 w-4" /> Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.id })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200",
                  formData.category === cat.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                )}
              >
                <div className={cn("p-2 rounded-xl text-white", cat.color)}>
                  {/* Icon mapping would go here, using a placeholder for now */}
                  <Tag className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Note (Optional)
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="What was this for?"
            rows={3}
            className="w-full px-4 py-3 bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.category || !formData.amount}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Save Transaction
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
