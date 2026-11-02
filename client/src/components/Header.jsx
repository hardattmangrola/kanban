import React from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import {
  Kanban,
  Plus,
  RotateCw,
  Bug,
  Sun,
  Moon,
  Activity,
  Layers,
} from 'lucide-react';

export const Header = ({ currentTheme, onToggleTheme }) => {
  const {
    fetchTasks,
    isLoading,
    openCreateModal,
    simulateError,
    setSimulateError,
    inFlightMoves,
    tasks,
  } = useTaskStore();

  const totalCards = tasks.length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
              <Kanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  TaskFlow
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  MERN Board
                </span>
                {inFlightMoves > 0 && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
                    <Activity className="w-3 h-3 animate-spin" />
                    Syncing ({inFlightMoves})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resilient Kanban • Atomic Persistence • Zero-Flicker Themes
              </p>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            
            {/* Total cards badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalCards} Tasks</span>
            </div>

            {/* Simulated Error Toggle (Step 5 Evaluation Hook) */}
            <button
              onClick={() => setSimulateError(!simulateError)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                simulateError
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 shadow-sm ring-2 ring-rose-400/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Toggle to force API calls to fail with HTTP 500 to evaluate optimistic rollback resilience"
              aria-pressed={simulateError}
            >
              <Bug className={`w-3.5 h-3.5 ${simulateError ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`} />
              <span>Simulate 500 Error: {simulateError ? 'ON' : 'OFF'}</span>
            </button>

            {/* Theme Toggle (Step 3) */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Refresh Board */}
            <button
              onClick={() => fetchTasks()}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Refresh board data from MongoDB"
              aria-label="Refresh tasks"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            {/* New Task Button */}
            <button
              onClick={() => openCreateModal('todo')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
