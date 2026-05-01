import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, doc, getDoc, setDoc, onSnapshot, collection, query, where, OperationType, handleFirestoreError } from './firebase';
import { UserProfile, Transaction } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Settings from './components/Settings';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  transactions: Transaction[];
  loading: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'add' | 'settings'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    let unsubscribeTransactions: (() => void) | undefined;
    let unsubscribeProfile: (() => void) | undefined;

    const initData = async () => {
      setLoading(true);
      setError(null);
      const profileRef = doc(db, 'users', user.uid);
      
      try {
        // Listen for profile changes
        unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            setTheme(data.theme || 'light');
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              currency: '$',
              monthlyBudget: 1000,
              theme: 'light',
              role: 'user',
            };
            setDoc(profileRef, newProfile);
          }
        }, (err) => {
          const errInfo = handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          setError(errInfo);
        });

        // Listen for transactions
        const q = query(collection(db, 'transactions'), where('uid', '==', user.uid));
        unsubscribeTransactions = onSnapshot(q, (snapshot) => {
          const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
          setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }, (err) => {
          const errInfo = handleFirestoreError(err, OperationType.LIST, 'transactions');
          setError(errInfo);
        });

      } catch (err) {
        const errInfo = handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        setError(errInfo);
      } finally {
        setLoading(false);
      }
    };

    initData();

    return () => {
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 text-center">
        <div className="max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-red-200 dark:border-red-900/30 shadow-xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm font-mono bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl overflow-auto max-h-40">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-xl font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <AppContext.Provider value={{ user, profile, transactions, loading, theme, setTheme }}>
      <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'transactions' && <TransactionList />}
              {activeTab === 'add' && <TransactionForm onSuccess={() => setActiveTab('dashboard')} />}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </AppContext.Provider>
  );
}
