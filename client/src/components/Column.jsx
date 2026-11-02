import React, { useState } from 'react';
import { Card } from './Card.jsx';
import { useTaskStore } from '../store/useTaskStore.js';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { Plus } from 'lucide-react';

const columnTitles = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
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

  const title = columnTitles[columnId] || columnId;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
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

    moveTask(taskId, columnId, index);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropOnColumn}
      className={`flex flex-col h-full rounded-xl bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 p-3 transition-colors min-h-[580px] ${
        isDragOver
          ? 'ring-1 ring-zinc-400 dark:ring-zinc-600 bg-zinc-100 dark:bg-zinc-900/60'
          : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase">
            {title}
          </h2>
          <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center">
            {tasks.length}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => openCreateModal(columnId)}
          className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          title={`Add task to ${title}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Cards List / Drop Zone */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        {tasks.map((task, index) => (
          <div
            key={task._id}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropTargetPosition(index);
            }}
            onDrop={(e) => handleDropOnCard(e, index)}
          >
            {/* Visual drop target placeholder */}
            {isDragOver && dropTargetPosition === index && (
              <div className="h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-full mb-2 opacity-80" />
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
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-lg text-center">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-1.5">
              No tasks
            </p>
            <button
              onClick={() => openCreateModal(columnId)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
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
        className="mt-2.5 w-full justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-normal border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        <span>Add task</span>
      </Button>
    </div>
  );
};
