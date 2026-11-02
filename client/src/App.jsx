import React, { useEffect } from 'react';
import { useTaskStore } from './store/useTaskStore.js';
import { useTheme } from './hooks/useTheme.js';
import { Header } from './components/Header.jsx';
import { Board } from './components/Board.jsx';
import { TaskModal } from './components/TaskModal.jsx';
import { Toast } from './components/Toast.jsx';
import { Button } from './components/ui/Button.jsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { fetchTasks, isLoading, error, tasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      {/* Top Bar */}
      <Header currentTheme={theme} onToggleTheme={toggleTheme} />

      {/* Main Board */}
      <div className="flex-1">
        {/* Connection Error Banner */}
        {error && tasks.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-medium">
                  Unable to connect to TaskFlow API ({error}). Verify backend is running on port 5000.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTasks()}
                className="h-7 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && tasks.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/40 animate-pulse border border-zinc-200 dark:border-zinc-800"
                />
              ))}
            </div>
          </div>
        ) : (
          <Board />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-3 mt-auto bg-white/50 dark:bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          made with ❤️ by hardatt
        </div>
      </footer>

      {/* Modals & Toasts */}
      <TaskModal />
      <Toast />
    </div>
  );
}

export default App;
