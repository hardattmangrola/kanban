import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import { Button } from './ui/Button.jsx';
import { X, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

export const TaskModal = () => {
  const {
    isModalOpen,
    editingTask,
    modalDefaultColumn,
    closeModal,
    createTask,
    updateTask,
    addSubtask,
    deleteSubtask,
  } = useTaskStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [columnId, setColumnId] = useState('todo');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'Medium');
      setColumnId(editingTask.columnId || 'todo');
      setSubtasks(editingTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setColumnId(modalDefaultColumn || 'todo');
      setSubtasks([]);
    }
    setErrorMsg('');
  }, [editingTask, modalDefaultColumn, isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const handleAddLocalSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;

    if (editingTask) {
      addSubtask(editingTask._id, newSubtaskInput.trim());
      setSubtasks([
        ...subtasks,
        { _id: `temp-${Date.now()}`, title: newSubtaskInput.trim(), isCompleted: false },
      ]);
    } else {
      setSubtasks([
        ...subtasks,
        { _id: `local-${Date.now()}`, title: newSubtaskInput.trim(), isCompleted: false },
      ]);
    }
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (subId) => {
    if (editingTask && !subId.startsWith('temp-')) {
      deleteSubtask(editingTask._id, subId);
    }
    setSubtasks(subtasks.filter((s) => s._id !== subId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingTask) {
        await updateTask(editingTask._id, {
          title: title.trim(),
          description: description.trim(),
          priority,
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          columnId,
          subtasks: subtasks.map((s) => ({
            title: s.title,
            isCompleted: s.isCompleted,
          })),
        });
      }
      closeModal();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeModal}
            className="h-6 w-6 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close dialog"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-md">
              {errorMsg}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 placeholder:text-zinc-400"
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 placeholder:text-zinc-400"
            />
          </div>

          {/* Priority & Column Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {!editingTask && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Column
                </label>
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Subtasks ({subtasks.length})
            </label>

            {/* List */}
            {subtasks.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1 mb-2 pr-0.5">
                {subtasks.map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {sub.isCompleted ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span className={sub.isCompleted ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-200'}>
                        {sub.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub._id)}
                      className="text-zinc-400 hover:text-rose-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                placeholder="Add subtask item..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLocalSubtask(e);
                  }
                }}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddLocalSubtask}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingTask ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
