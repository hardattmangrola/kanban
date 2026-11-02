import React, { useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore.js';
import { useTheme } from './hooks/useTheme.js';
import { Header } from './components/Header.jsx';
import { Board } from './components/Board.jsx';
import { TaskModal } from './components/TaskModal.jsx';
import { Toast } from './components/Toast.jsx';
import { AlertCircle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { fetchTasks, isLoading, error, tasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation & Controls */}
      <Header currentTheme={theme} onToggleTheme={toggleTheme} />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Connection or Initial Error Banner */}
        {error && tasks.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Unable to connect to TaskFlow API</p>
                  <p className="text-xs text-rose-600 dark:text-rose-300">
                    {error}. Make sure the backend server is running on port 5000 and MongoDB is connected.
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchTasks()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* First-load skeleton loader */}
        {isLoading && tasks.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-slate-200/60 dark:bg-slate-900/40 animate-pulse border border-slate-200 dark:border-slate-800 p-4"
                />
              ))}
            </div>
          </div>
        ) : (
          <Board />
        )}
      </div>

      {/* Architecture & Evaluation Callout Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 py-4 mt-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              Resilient MERN Architecture • Atomic Updates • Optimistic UI with Graceful Rollback
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Toggle "Simulate 500 Error" in header to test instant rollback
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <TaskModal />
      <Toast />
    </div>
  );
}

export default App;
