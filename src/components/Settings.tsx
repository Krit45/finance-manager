import React, { useState } from 'react';
import { useApp } from '../App';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from '../firebase';
import { 
  Settings as SettingsIcon, Wallet, DollarSign, 
  Moon, Sun, Save, Loader2, CheckCircle2 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const { profile, theme, setTheme } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    currency: profile?.currency || '$',
    monthlyBudget: profile?.monthlyBudget || 1000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        ...formData,
        monthlyBudget: parseFloat(formData.monthlyBudget.toString()),
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Customize your experience and financial goals.</p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-500">Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-500">Currency Symbol</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="$">$ (USD)</option>
                  <option value="₹">₹ (INR)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="¥">¥ (JPY)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-500">Monthly Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{formData.currency}</span>
                  <input
                    type="number"
                    value={formData.monthlyBudget}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      setFormData({ ...formData, monthlyBudget: val });
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : success ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Saved Successfully
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </form>

        {/* Appearance */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Sun className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">Appearance</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                theme === 'light' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' 
                  : 'border-zinc-100 dark:border-zinc-800'
              }`}
            >
              <Sun className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-bold">Light Mode</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                theme === 'dark' 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' 
                  : 'border-zinc-100 dark:border-zinc-800'
              }`}
            >
              <Moon className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-bold">Dark Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
