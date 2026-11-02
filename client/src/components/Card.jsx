import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
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

const priorityConfig = {
  High: {
    bg: 'bg-rose-50 dark:bg-rose-950/80',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    indicator: 'bg-rose-500',
  },
  Medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/80',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    indicator: 'bg-amber-500',
  },
  Low: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/80',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    indicator: 'bg-emerald-500',
  },
};

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

  const priorityStyle = priorityConfig[task.priority] || priorityConfig.Medium;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={`group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-indigo-400' : ''
      }`}
    >
      {/* Top Header: Priority Badge, Subtask Pill & Quick Controls */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.indicator}`} />
            {task.priority}
          </span>

          {/* Quick Subtask Counter Badge */}
          {totalSubtasks > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                progressPercent === 100
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
              title="Click to view checklist items"
            >
              <ListTodo className="w-3 h-3" />
              <span>{completedCount}/{totalSubtasks}</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            #{task.position + 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick column navigation buttons */}
          {canMoveLeft && (
            <button
              onClick={handleMoveLeft}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Move left to previous column"
              aria-label="Move left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {canMoveRight && (
            <button
              onClick={handleMoveRight}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Move right to next column"
              aria-label="Move right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Edit Button */}
          <button
            onClick={() => openEditModal(task)}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => deleteTask(task._id)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Drag Handle Icon for visual clarity */}
          <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors cursor-grab ml-1">
            <GripVertical className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-1.5">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* WILDCARD FEATURE (Option 3): Nested Checklist & Progress */}
      {totalSubtasks > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              <span>Checklist</span>
              <span className="text-[11px] font-mono text-slate-400">
                ({completedCount}/{totalSubtasks})
              </span>
            </button>
            <span
              className={`text-[11px] font-semibold font-mono ${
                progressPercent === 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                progressPercent === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>

          {/* Expandable Checklist Items List */}
          {isExpanded && (
            <div className="mt-2.5 space-y-1.5 animate-fade-in">
              {subtasks.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 group/sub text-xs transition-colors"
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
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span
                      className={`truncate transition-all duration-200 ${
                        sub.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteSubtask(task._id, sub._id)}
                    className="opacity-0 group-hover/sub:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity p-0.5"
                    title="Delete subtask"
                    aria-label={`Delete subtask ${sub.title}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Quick Add Subtask Form */}
              {showSubtaskInput ? (
                <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5 mt-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Subtask name..."
                    className="flex-1 text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubtaskInput(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSubtaskInput(true)}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Subtask</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* If no subtasks exist yet, provide a quick button to add one */}
      {totalSubtasks === 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => openEditModal(task)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add Checklist</span>
          </button>
        </div>
      )}
    </div>
  );
};
