import React, { useState } from 'react';
import { Card } from './Card.jsx';
import { useTaskStore } from '../store/useTaskStore.js';
import { Plus, CircleDashed, Clock, CheckCircle2 } from 'lucide-react';

const columnMeta = {
  todo: {
    title: 'To Do',
    icon: <CircleDashed className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    accentBorder: 'border-t-slate-400 dark:border-t-slate-500',
  },
  'in-progress': {
    title: 'In Progress',
    icon: <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300',
    accentBorder: 'border-t-indigo-500 dark:border-t-indigo-400',
  },
  done: {
    title: 'Done',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300',
    accentBorder: 'border-t-emerald-500 dark:border-t-emerald-400',
  },
};

export const Column = ({
  columnId,
  tasks = [],
  draggedTaskId,
  onDragStart,
  onDragEnd,
}) => {
  const { openCreateModal, moveTask } = useTaskStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropTargetPosition, setDropTargetPosition] = useState(null);

  const meta = columnMeta[columnId] || {
    title: columnId,
    icon: null,
    badgeBg: 'bg-slate-100',
    accentBorder: 'border-t-slate-400',
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only deactivate if leaving the column element itself
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDropTargetPosition(null);
    }
  };

  const handleDropOnColumn = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDropTargetPosition(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Default to putting at the end of the column if dropped on column container
    const newPosition = tasks.length;
    moveTask(taskId, columnId, newPosition);
  };

  const handleDropOnCard = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDropTargetPosition(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Drop before or at this card's index
    moveTask(taskId, columnId, index);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropOnColumn}
      className={`flex flex-col h-full rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 border-t-4 ${
        meta.accentBorder
      } p-4 transition-all duration-200 min-h-[580px] ${
        isDragOver
          ? 'ring-2 ring-indigo-500/50 bg-indigo-50/30 dark:bg-indigo-950/20'
          : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {meta.icon}
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {meta.title}
          </h2>
          <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${meta.badgeBg}`}
          >
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => openCreateModal(columnId)}
          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title={`Add task to ${meta.title}`}
          aria-label={`Add task to ${meta.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards List / Drop Zone */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
        {tasks.map((task, index) => (
          <div
            key={task._id}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropTargetPosition(index);
            }}
            onDrop={(e) => handleDropOnCard(e, index)}
            className="transition-all"
          >
            {/* Visual drop indicator line when dragging */}
            {isDragOver && dropTargetPosition === index && (
              <div className="h-1 bg-indigo-500 rounded-full mb-2 animate-pulse" />
            )}

            <Card
              task={task}
              isDragging={draggedTaskId === task._id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}

        {/* Empty state placeholder */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
              No tasks in {meta.title}
            </p>
            <button
              onClick={() => openCreateModal(columnId)}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add a card
            </button>
          </div>
        )}
      </div>

      {/* Bottom Quick Add Action */}
      <button
        onClick={() => openCreateModal(columnId)}
        className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800/80 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 transition-all shadow-none hover:shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add card</span>
      </button>
    </div>
  );
};
