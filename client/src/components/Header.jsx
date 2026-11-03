import React from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import {
  Kanban,
  Plus,
  RotateCw,
  Sun,
  Moon,
  Activity,
  Bug,
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

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
        
        {/* Left: Brand & Clean Workspace Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 flex items-center justify-center font-bold shadow-sm">
            <Kanban className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight shrink-0">
              TaskFlow
            </span>
            <span className="text-zinc-300 dark:text-zinc-700 hidden xs:inline">/</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden xs:inline">
              Board
            </span>
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 text-[10px] sm:text-[11px] font-mono px-1.5 py-0">
              {tasks.length}
            </Badge>

            {/* In-flight sync state indicator */}
            {inFlightMoves > 0 && (
              <span className="flex items-center gap-1 sm:gap-1.5 ml-1 sm:ml-2 text-[10px] sm:text-[11px] text-zinc-500 font-medium shrink-0">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Syncing</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Simulated Error Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSimulateError(!simulateError)}
            className="flex items-center gap-1.5 text-[11px] sm:text-xs font-normal h-8 px-2 sm:px-3"
            title="Toggle to force API calls to fail for rollback testing"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                simulateError ? 'bg-rose-500 shadow-sm shadow-rose-500' : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            />
            <span className="hidden md:inline">Simulate 500: {simulateError ? 'ON' : 'OFF'}</span>
            <span className="md:hidden">500: {simulateError ? 'ON' : 'OFF'}</span>
          </Button>

          {/* Refresh Board Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchTasks()}
            disabled={isLoading}
            className="h-8 w-8"
            title="Refresh board data"
            aria-label="Refresh tasks"
          >
            <RotateCw className={`w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-8 w-8"
            title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-100" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-900" />
            )}
          </Button>

          {/* Primary New Task Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => openCreateModal('todo')}
            className="gap-1 h-8 px-2.5 sm:px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Task</span>
          </Button>

        </div>
      </div>
    </header>
  );
};
