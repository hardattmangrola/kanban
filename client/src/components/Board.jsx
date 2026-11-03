import React, { useState, useEffect, useCallback } from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import { Column } from './Column.jsx';
import { CircleDot, Clock, CheckCircle2 } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: CircleDot, color: 'text-pink-500' },
  { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'text-sky-500' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
];

export const Board = () => {
  const { tasks } = useTaskStore();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleDragStart = useCallback((e, task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.setData('sourceColumn', task.columnId);
    e.dataTransfer.setData('sourcePosition', task.position.toString());

    // Defer setting draggedTaskId by 1 frame so the browser captures a crisp preview first
    requestAnimationFrame(() => {
      setDraggedTaskId(task._id);
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
  }, []);

  // Global safety net to clear draggedTaskId if mouse is released anywhere
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggedTaskId(null);
    };
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, []);

  const visibleColumns = activeTab === 'all' 
    ? COLUMNS 
    : COLUMNS.filter((col) => col.id === activeTab);

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
      {/* Mobile Column Switcher (Tabs) */}
      <div className="md:hidden flex items-center gap-1.5 p-1 mb-3 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <span>All</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {tasks.length}
          </span>
        </button>

        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.columnId === col.id).length;
          const Icon = col.icon;
          return (
            <button
              key={col.id}
              onClick={() => setActiveTab(col.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === col.id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${col.color}`} />
              <span>{col.title}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Board Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-start`}>
        {visibleColumns.map((col) => {
          const colTasks = tasks
            .filter((task) => task.columnId === col.id)
            .sort((a, b) => a.position - b.position);

          return (
            <Column
              key={col.id}
              columnId={col.id}
              tasks={colTasks}
              draggedTaskId={draggedTaskId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>
    </main>
  );
};
