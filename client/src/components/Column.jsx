import React, { useState, useCallback } from 'react';
import { Card } from './Card.jsx';
import { useTaskStore } from '../store/useTaskStore.js';
import { Button } from './ui/Button.jsx';
import { Plus, CircleDot, Clock, CheckCircle2 } from 'lucide-react';

const columnConfig = {
  todo: {
    title: 'To Do',
    Icon: CircleDot,
    iconColor: 'text-pink-600 dark:text-pink-400',
    solidBorderAndBg:
      'border-pink-300 bg-pink-100/80 dark:border-pink-500/40 dark:bg-[#25101a]',
    badgeStyle:
      'bg-white text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 border border-pink-300 dark:border-pink-800 shadow-xs',
    indicatorLine: 'bg-pink-500 dark:bg-pink-400',
  },
  'in-progress': {
    title: 'In Progress',
    Icon: Clock,
    iconColor: 'text-sky-600 dark:text-sky-400',
    solidBorderAndBg:
      'border-sky-300 bg-sky-100/80 dark:border-sky-500/40 dark:bg-[#0c2233]',
    badgeStyle:
      'bg-white text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800 shadow-xs',
    indicatorLine: 'bg-sky-500 dark:bg-sky-400',
  },
  done: {
    title: 'Done',
    Icon: CheckCircle2,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    solidBorderAndBg:
      'border-emerald-300 bg-emerald-100/80 dark:border-emerald-500/40 dark:bg-[#082215]',
    badgeStyle:
      'bg-white text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs',
    indicatorLine: 'bg-emerald-500 dark:bg-emerald-400',
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

  const config = columnConfig[columnId] || {
    title: columnId,
    Icon: CircleDot,
    iconColor: 'text-zinc-500',
    solidBorderAndBg: 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900',
    badgeStyle: 'bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200',
    indicatorLine: 'bg-zinc-900 dark:bg-zinc-100',
  };

  const { title, Icon, iconColor, solidBorderAndBg, badgeStyle, indicatorLine } = config;

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  }, [isDragOver]);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDropTargetPosition(null);
    }
  }, []);

  const handleCardDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetPosition !== index) {
      setDropTargetPosition(index);
    }
  }, [dropTargetPosition]);

  const handleDropOnColumn = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDropTargetPosition(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    if (onDragEnd) onDragEnd();

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

    if (onDragEnd) onDragEnd();

    moveTask(taskId, columnId, index);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropOnColumn}
      className={`flex flex-col h-full rounded-2xl border-2 p-3.5 min-h-[580px] shadow-sm ${solidBorderAndBg}`}
    >
      {/* Column Header with Lucide Icon and Solid Pastel Pill Badge */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase">
            {title}
          </h2>
          <span
            className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeStyle}`}
          >
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => openCreateModal(columnId)}
          className="h-6 w-6 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10"
          title={`Add task to ${title}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Cards List / Drop Zone with pt-3.5 headroom so the first card's 3D pushpin is never clipped */}
      <div className="flex-1 space-y-3.5 overflow-y-auto pt-3.5 pb-1 px-1 pr-1.5 -mr-0.5">
        {tasks.map((task, index) => (
          <div
            key={task._id}
            onDragOver={(e) => handleCardDragOver(e, index)}
            onDrop={(e) => handleDropOnCard(e, index)}
          >
            {/* Smooth drop indicator line */}
            {isDragOver && dropTargetPosition === index && (
              <div className={`h-1.5 rounded-full mb-2 opacity-90 shadow-sm ${indicatorLine}`} />
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
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-black/15 dark:border-white/15 rounded-xl text-center bg-white/50 dark:bg-black/20">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">
              No tasks
            </p>
            <button
              onClick={() => openCreateModal(columnId)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
            >
              <Plus className="w-3 h-3" />
              Add task
            </button>
          </div>
        )}
      </div>

      {/* Bottom Quick Add Action */}
      <Button
        variant="ghost"
        onClick={() => openCreateModal(columnId)}
        className="mt-2.5 w-full justify-center text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 text-xs font-medium bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 border border-black/5 dark:border-white/5 rounded-xl shadow-xs"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        <span>Add task</span>
      </Button>
    </div>
  );
};
