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
      className={`group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3.5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40 scale-[0.98] border-dashed border-zinc-400 dark:border-zinc-600' : ''
      }`}
    >
      {/* Top Row: Priority Badge, Subtask Counter & Card Controls */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority Badge - Retains Semantic Color */}
          <Badge variant={priorityVariant} className="font-semibold text-[10px] tracking-wide">
            {task.priority}
          </Badge>

          {/* Subtask pill badge */}
          {totalSubtasks > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Toggle checklist"
            >
              <ListTodo className="w-2.5 h-2.5" />
              <span>{completedCount}/{totalSubtasks}</span>
            </button>
          )}

          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
            #{task.position + 1}
          </span>
        </div>

        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {canMoveLeft && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMoveLeft}
              className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
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
              className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              title="Move to next column"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(task)}
            className="h-6 w-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            title="Edit task"
          >
            <Edit2 className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTask(task._id)}
            className="h-6 w-6 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
            title="Delete task"
          >
            <Trash2 className="w-3 h-3" />
          </Button>

          <span className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors ml-0.5 cursor-grab">
            <GripVertical className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mb-1">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2 leading-relaxed font-normal">
          {task.description}
        </p>
      )}

      {/* Subtasks Progress Bar & Checklist */}
      {totalSubtasks > 0 && (
        <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>Subtasks</span>
              <span className="font-mono text-zinc-400">
                ({completedCount}/{totalSubtasks})
              </span>
            </button>
            <span
              className={`font-mono text-[10px] font-semibold ${
                progressPercent === 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          {/* Animated Progress Bar (Retains emerald indicator on 100%) */}
          <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out rounded-full ${
                progressPercent === 100
                  ? 'bg-emerald-500'
                  : 'bg-zinc-900 dark:bg-zinc-100'
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
                  className="flex items-center justify-between gap-2 py-1 px-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group/sub text-[11px] transition-colors"
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
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        sub.isCompleted
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-700 dark:text-zinc-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteSubtask(task._id, sub._id)}
                    className="opacity-0 group-hover/sub:opacity-100 text-zinc-400 hover:text-rose-500 transition-opacity p-0.5"
                    title="Delete subtask"
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
                    className="flex-1 text-[11px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300"
                    autoFocus
                  />
                  <Button type="submit" size="sm" className="h-6 px-2 text-[10px]">
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSubtaskInput(false)}
                    className="h-6 px-1.5 text-[10px] text-zinc-400 hover:text-zinc-600"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSubtaskInput(true)}
                  className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 pt-1"
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
        <div className="mt-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
          <button
            onClick={() => openEditModal(task)}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Add Checklist</span>
          </button>
        </div>
      )}
    </div>
  );
};
