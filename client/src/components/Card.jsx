import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ListTodo,
} from 'lucide-react';

const columnOrder = ['todo', 'in-progress', 'done'];

export const Card = ({ task, isDragging, onDragStart, onDragEnd }) => {
  const {
    openEditModal,
    deleteTask,
    moveTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
  } = useTaskStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = subtasks.length;
  const progressPercent =
    totalSubtasks > 0 ? Math.round((completedCount / totalSubtasks) * 100) : 0;

  // Move helpers
  const currentColIndex = columnOrder.indexOf(task.columnId);
  const canMoveLeft = currentColIndex > 0;
  const canMoveRight = currentColIndex < columnOrder.length - 1;

  const handleMoveLeft = () => {
    if (canMoveLeft) {
      moveTask(task._id, columnOrder[currentColIndex - 1], 0);
    }
  };

  const handleMoveRight = () => {
    if (canMoveRight) {
      moveTask(task._id, columnOrder[currentColIndex + 1], 0);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    await addSubtask(task._id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setShowSubtaskInput(false);
  };

  const priorityVariant =
    task.priority === 'High'
      ? 'high'
      : task.priority === 'Medium'
      ? 'medium'
      : 'low';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={`group relative rounded-xl border p-4 select-none cursor-grab active:cursor-grabbing transition-all duration-200 transform-gpu ${
        isDragging
          ? 'opacity-25 border-2 border-dashed border-amber-300 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/20 shadow-inner scale-[0.98]'
          : 'bg-[#fefce8] dark:bg-[#1e1b12] border-amber-200/80 dark:border-amber-500/25 shadow-[0_2px_8px_rgba(180,83,9,0.06),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:rotate-[0.8deg] hover:shadow-[0_10px_22px_rgba(180,83,9,0.12),0_2px_6px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_10px_24px_rgba(0,0,0,0.6)] active:scale-[1.03] active:rotate-2 active:shadow-2xl'
      }`}
    >
      {/* 3D Pushpin giving the feel of a sticky note pinned on a board */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none drop-shadow-sm">
        {/* 3D Glossy pushpin head with bevel and reflection */}
        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-400 border border-rose-700/50 shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1.5px_1.5px_rgba(255,255,255,0.7)] flex items-center justify-center relative">
          <div className="w-1.5 h-1.5 rounded-full bg-white/80 absolute top-0.5 left-0.5" />
          <div className="w-1 h-1 rounded-full bg-rose-700/50" />
        </div>
        {/* Metal needle shaft entering paper */}
        <div className="w-0.5 h-1 bg-gradient-to-b from-slate-400 to-slate-600 -mt-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
      </div>

      {/* Top Row: Priority Badge, Subtask Counter & Card Controls */}
      <div className="flex items-center justify-between gap-2 mb-2 pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority Badge - Retains Semantic Color */}
          <Badge variant={priorityVariant} className="font-semibold text-[10px] tracking-wide shadow-2xs">
            {task.priority}
          </Badge>

          {/* Subtask pill badge */}
          {totalSubtasks > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 hover:bg-amber-200/80 dark:hover:bg-amber-900/80 transition-colors border border-amber-200 dark:border-amber-800/60"
              title="Toggle checklist"
            >
              <ListTodo className="w-2.5 h-2.5" />
              <span>{completedCount}/{totalSubtasks}</span>
            </button>
          )}

          <span className="text-[10px] text-amber-800/60 dark:text-amber-300/60 font-mono font-medium">
            #{task.position + 1}
          </span>
        </div>

        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {canMoveLeft && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMoveLeft}
              className="h-6 w-6 text-amber-800/70 dark:text-amber-300/70 hover:text-zinc-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-white/10"
              title="Move to previous column"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
          )}

          {canMoveRight && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMoveRight}
              className="h-6 w-6 text-amber-800/70 dark:text-amber-300/70 hover:text-zinc-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-white/10"
              title="Move to next column"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(task)}
            className="h-6 w-6 text-amber-800/70 dark:text-amber-300/70 hover:text-zinc-950 dark:hover:text-white hover:bg-amber-200/50 dark:hover:bg-white/10"
            title="Edit task"
          >
            <Edit2 className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTask(task._id)}
            className="h-6 w-6 text-amber-800/70 dark:text-amber-300/70 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-amber-200/50 dark:hover:bg-white/10"
            title="Delete task"
          >
            <Trash2 className="w-3 h-3" />
          </Button>

          <span className="text-amber-800/40 dark:text-amber-400/40 group-hover:text-amber-800/80 transition-colors ml-0.5 cursor-grab">
            <GripVertical className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Sticky Note Title */}
      <h3 className="text-xs font-bold text-zinc-900 dark:text-amber-50 leading-snug mb-1">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-[11px] text-zinc-700 dark:text-amber-200/80 line-clamp-2 mb-2 leading-relaxed font-normal">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress Bar & Checklist */}
      {totalSubtasks > 0 && (
        <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-500/20">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 font-semibold text-amber-900 dark:text-amber-200 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>Subtasks</span>
              <span className="font-mono text-amber-800/70 dark:text-amber-300/70 text-[10px]">
                ({completedCount}/{totalSubtasks})
              </span>
            </button>
            <span
              className={`font-mono text-[10px] font-bold ${
                progressPercent === 100
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-900 dark:text-amber-300'
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-1.5 bg-amber-100 dark:bg-amber-950/80 rounded-full overflow-hidden shadow-2xs">
            <div
              className={`h-full transition-all duration-300 ease-out rounded-full shadow-xs ${
                progressPercent === 100
                  ? 'bg-emerald-600'
                  : 'bg-zinc-800 dark:bg-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Expandable Checklist Items List */}
          {isExpanded && (
            <div className="mt-2 space-y-1 animate-fade-in">
              {subtasks.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center justify-between gap-2 py-1 px-1.5 rounded-md hover:bg-amber-100/60 dark:hover:bg-amber-900/30 group/sub text-[11px] transition-colors"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={(e) =>
                        toggleSubtask(task._id, sub._id, e.target.checked)
                      }
                      className="sr-only"
                    />
                    {sub.isCompleted ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-amber-800/60 dark:text-amber-400/60 shrink-0" />
                    )}
                    <span
                      className={`truncate font-medium ${
                        sub.isCompleted
                          ? 'line-through text-amber-800/50 dark:text-amber-300/40'
                          : 'text-zinc-900 dark:text-amber-100'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteSubtask(task._id, sub._id)}
                    className="opacity-0 group-hover/sub:opacity-100 text-amber-800/60 hover:text-rose-600 dark:text-amber-400/60 dark:hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Quick Add Subtask Input */}
              {showSubtaskInput ? (
                <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="New subtask..."
                    className="flex-1 text-[11px] px-2 py-1 rounded-md border border-amber-200 dark:border-amber-700 bg-white/90 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="h-6 px-2 text-[10px] bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950">
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSubtaskInput(false)}
                    className="h-6 px-1.5 text-[10px] text-amber-800/70 hover:text-zinc-950 dark:text-amber-300/70"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSubtaskInput(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-amber-900 dark:text-amber-300 hover:text-zinc-950 dark:hover:text-white pt-1"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Add Subtask</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* If no subtasks exist yet, clean action to add checklist */}
      {totalSubtasks === 0 && (
        <div className="mt-2 pt-1.5 border-t border-amber-200 dark:border-amber-500/20">
          <button
            onClick={() => openEditModal(task)}
            className="flex items-center gap-1 text-[10px] font-medium text-amber-800/70 hover:text-zinc-950 dark:text-amber-300/70 dark:hover:text-white transition-colors"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Add Checklist</span>
          </button>
        </div>
      )}
    </div>
  );
};
