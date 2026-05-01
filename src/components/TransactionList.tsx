import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { CATEGORIES, TransactionType } from '../types';
import { db, doc, deleteDoc, handleFirestoreError, OperationType } from '../firebase';
import { 
  Search, Filter, Trash2, Calendar, 
  ArrowUpRight, ArrowDownRight, Tag, 
  ChevronRight, ChevronLeft, MoreVertical,
  ChevronDown, Info, Clock, Repeat
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function TransactionList() {
  const { transactions, profile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const currency = profile?.currency || '$';

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, filterType, filterCategory]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and track your financial history.</p>
        </div>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search notes or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Transaction</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              <AnimatePresence>
                {filteredTransactions.map((tx) => {
                  const category = CATEGORIES.find(c => c.id === tx.category);
                  const isExpanded = expandedId === tx.id;
                  
                  return (
                    <React.Fragment key={tx.id}>
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setExpandedId(isExpanded ? null : tx.id || null)}
                        className={cn(
                          "group cursor-pointer transition-colors",
                          isExpanded ? "bg-emerald-50/30 dark:bg-emerald-500/5" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-xl transition-transform duration-200",
                              isExpanded && "scale-110",
                              tx.type === 'income' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                            )}>
                              {tx.type === 'income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {category?.name || 'Transaction'}
                              </p>
                              {tx.isRecurring && (
                                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">Recurring</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", category?.color || 'bg-gray-400')} />
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">{category?.name || 'Other'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(tx.date), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "font-bold",
                            tx.type === 'income' ? "text-emerald-600" : "text-red-600"
                          )}>
                            {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                tx.id && handleDelete(tx.id);
                              }}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <ChevronDown className={cn(
                              "h-4 w-4 text-zinc-400 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )} />
                          </div>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-emerald-50/10 dark:bg-emerald-500/5 overflow-hidden"
                          >
                            <td colSpan={5} className="px-6 py-0">
                              <motion.div 
                                initial={{ y: -10 }}
                                animate={{ y: 0 }}
                                className="py-6 space-y-4"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                      <Info className="h-3 w-3" />
                                      Notes
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                      {tx.note || "No notes provided for this transaction."}
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                      <Clock className="h-3 w-3" />
                                      Details
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-white dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Type</p>
                                        <p className={cn(
                                          "text-sm font-bold capitalize",
                                          tx.type === 'income' ? "text-emerald-500" : "text-red-500"
                                        )}>
                                          {tx.type}
                                        </p>
                                      </div>
                                      <div className="bg-white dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Recurring</p>
                                        <div className="flex items-center gap-1.5">
                                          <Repeat className={cn("h-3 w-3", tx.isRecurring ? "text-blue-500" : "text-zinc-300")} />
                                          <p className="text-sm font-bold">{tx.isRecurring ? "Yes" : "No"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold">No transactions found</h3>
              <p className="text-zinc-500">Try adjusting your filters or add a new entry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
