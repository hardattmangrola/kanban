import { create } from 'zustand';
import { taskApi } from '../services/api.js';

/**
 * TaskFlow Centralized Zustand Store
 * Adheres to Single Responsibility & Dependency Inversion Principles:
 * Encapsulates state mutation logic, optimistic updates, rollback resilience,
 * and rapid interaction guards.
 */

// Serialized FIFO Promise queue to prevent out-of-order API persistence
let sequentialMoveQueue = Promise.resolve();

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  toast: null,
  
  // Evaluation simulation toggle: When true, forces moveTask API to return HTTP 500
  simulateError: false,

  // Modal State
  isModalOpen: false,
  editingTask: null,
  modalDefaultColumn: 'todo',

  // Rapid Interaction Guard state: tracks active in-flight request count and request version
  inFlightMoves: 0,
  moveVersion: 0,

  /**
   * Set simulated error toggle
   */
  setSimulateError: (value) => {
    set({ simulateError: value });
    get().showToast(
      value
        ? 'Simulated 500 Error ENABLED (Next drag will fail & rollback)'
        : 'Simulated Error Disabled (Normal API persistence)',
      value ? 'warning' : 'info'
    );
  },

  /**
   * Show toast alert
   */
  showToast: (message, type = 'info') => {
    const id = Date.now();
    set({ toast: { id, message, type } });

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      const currentToast = get().toast;
      if (currentToast && currentToast.id === id) {
        set({ toast: null });
      }
    }, 4000);
  },

  clearToast: () => set({ toast: null }),

  /**
   * Open Modal for creating or editing
   */
  openCreateModal: (columnId = 'todo') => {
    set({ isModalOpen: true, editingTask: null, modalDefaultColumn: columnId });
  },

  openEditModal: (task) => {
    set({ isModalOpen: true, editingTask: task, modalDefaultColumn: task.columnId });
  },

  closeModal: () => {
    set({ isModalOpen: false, editingTask: null });
  },

  /**
   * Fetch all tasks from backend
   */
  fetchTasks: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const response = await taskApi.getAllTasks();
      // Ensure sorted order by column and position
      const sorted = (response.data || []).sort((a, b) => {
        if (a.columnId === b.columnId) {
          return a.position - b.position;
        }
        return a.columnId.localeCompare(b.columnId);
      });
      set({ tasks: sorted, isLoading: false, error: null });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      if (!silent) {
        get().showToast(`Failed to load tasks: ${err.message}`, 'error');
      }
    }
  },

  /**
   * Create a new task
   */
  createTask: async (taskData) => {
    try {
      const response = await taskApi.createTask(taskData);
      const created = response.data;
      set((state) => ({
        tasks: [...state.tasks, created],
      }));
      get().showToast('Task created successfully!', 'success');
      return created;
    } catch (err) {
      get().showToast(`Error creating task: ${err.message}`, 'error');
      throw err;
    }
  },

  /**
   * Update task details (title, description, priority)
   */
  updateTask: async (id, taskData) => {
    try {
      const response = await taskApi.updateTask(id, taskData);
      const updated = response.data;
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...updated } : t)),
      }));
      get().showToast('Task updated successfully!', 'success');
      return updated;
    } catch (err) {
      get().showToast(`Error updating task: ${err.message}`, 'error');
      throw err;
    }
  },

  /**
   * Delete a task with atomic positional cleanup
   */
  deleteTask: async (id) => {
    const taskToDelete = get().tasks.find((t) => t._id === id);
    if (!taskToDelete) return;

    // Snapshot for rollback in case delete fails
    const previousTasks = [...get().tasks];

    // Optimistically remove and recompute positions in the column
    set((state) => {
      const filtered = state.tasks.filter((t) => t._id !== id);
      return {
        tasks: filtered.map((t) => {
          if (t.columnId === taskToDelete.columnId && t.position > taskToDelete.position) {
            return { ...t, position: t.position - 1 };
          }
          return t;
        }),
      };
    });

    try {
      await taskApi.deleteTask(id);
      get().showToast('Task deleted successfully', 'success');
    } catch (err) {
      // Rollback on failure
      set({ tasks: previousTasks });
      get().showToast(`Failed to delete task: ${err.message}. Restored.`, 'error');
    }
  },

  /**
   * OPTIMISTIC UI MOVE & RACE CONDITION DEFENSE
   * Moves a card within or across columns with instant client state update,
   * snapshot rollback resilience, and rapid interaction guards via FIFO promise queue.
   */
  moveTask: async (taskId, destinationColumn, destinationPosition) => {
    const state = get();
    const currentTasks = state.tasks;
    const taskToMove = currentTasks.find((t) => t._id === taskId);
    if (!taskToMove) return;

    const sourceColumn = taskToMove.columnId;
    const sourcePosition = taskToMove.position;
    const targetColumn = destinationColumn || sourceColumn;
    const targetPosition = Math.max(0, destinationPosition);

    // If position and column didn't actually change, no-op
    if (sourceColumn === targetColumn && sourcePosition === targetPosition) {
      return;
    }

    // 1. Immutable snapshot of previous state for graceful rollback
    const snapshotTasks = JSON.parse(JSON.stringify(currentTasks));
    const currentMoveVersion = state.moveVersion + 1;

    // 2. Perform INSTANT OPTIMISTIC CLIENT REORDER
    let reorderedTasks = [];

    if (sourceColumn === targetColumn) {
      // Reordering within the SAME column
      const colTasks = currentTasks
        .filter((t) => t.columnId === sourceColumn && t._id !== taskId)
        .sort((a, b) => a.position - b.position);

      colTasks.splice(targetPosition, 0, {
        ...taskToMove,
        position: targetPosition,
      });

      const updatedColTasks = colTasks.map((t, idx) => ({ ...t, position: idx }));
      const otherTasks = currentTasks.filter((t) => t.columnId !== sourceColumn);
      reorderedTasks = [...otherTasks, ...updatedColTasks];
    } else {
      // Moving ACROSS different columns
      // A. Remove from source column and re-index remaining
      const sourceColTasks = currentTasks
        .filter((t) => t.columnId === sourceColumn && t._id !== taskId)
        .sort((a, b) => a.position - b.position)
        .map((t, idx) => ({ ...t, position: idx }));

      // B. Insert into destination column at targetPosition and re-index
      const destColTasks = currentTasks
        .filter((t) => t.columnId === targetColumn && t._id !== taskId)
        .sort((a, b) => a.position - b.position);

      destColTasks.splice(targetPosition, 0, {
        ...taskToMove,
        columnId: targetColumn,
        position: targetPosition,
      });

      const updatedDestColTasks = destColTasks.map((t, idx) => ({ ...t, position: idx }));
      const unaffectedTasks = currentTasks.filter(
        (t) => t.columnId !== sourceColumn && t.columnId !== targetColumn && t._id !== taskId
      );

      reorderedTasks = [...unaffectedTasks, ...sourceColTasks, ...updatedDestColTasks];
    }

    // Apply instant optimistic client update
    set({
      tasks: reorderedTasks,
      moveVersion: currentMoveVersion,
      inFlightMoves: state.inFlightMoves + 1,
    });

    // 3. RAPID INTERACTION GUARD: Enqueue API call through sequential FIFO queue
    sequentialMoveQueue = sequentialMoveQueue
      .then(async () => {
        try {
          await taskApi.moveTask(
            taskId,
            {
              destinationColumn: targetColumn,
              destinationPosition: targetPosition,
              sourceColumn,
              sourcePosition,
            },
            get().simulateError
          );

          // Decrement in-flight counter
          set((s) => ({ inFlightMoves: Math.max(0, s.inFlightMoves - 1) }));
        } catch (err) {
          // 4. GRACEFUL ROLLBACK ON FAILURE
          console.warn('[Optimistic Move Failed] Gracefully rolling back card position:', err.message);

          // Revert to snapshot
          set({
            tasks: snapshotTasks,
            inFlightMoves: Math.max(0, get().inFlightMoves - 1),
          });

          get().showToast(
            `Move failed: ${err.message || 'Network error'}. State restored.`,
            'error'
          );
        }
      })
      .catch((queueErr) => {
        console.error('[Sequential Move Queue Error]:', queueErr);
        set((s) => ({ inFlightMoves: Math.max(0, s.inFlightMoves - 1) }));
      });

    return sequentialMoveQueue;
  },

  /**
   * Subtask Management (Option 3: Nested Checklist & Progress)
   */
  addSubtask: async (taskId, title) => {
    try {
      const response = await taskApi.addSubtask(taskId, title);
      const updated = response.data;
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? updated : t)),
      }));
      get().showToast('Subtask added', 'success');
      return updated;
    } catch (err) {
      get().showToast(`Failed to add subtask: ${err.message}`, 'error');
    }
  },

  toggleSubtask: async (taskId, subtaskId, isCompleted) => {
    // Optimistic toggle
    const previousTasks = [...get().tasks];
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task._id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((sub) =>
            sub._id === subtaskId ? { ...sub, isCompleted } : sub
          ),
        };
      }),
    }));

    try {
      await taskApi.updateSubtask(taskId, subtaskId, { isCompleted });
    } catch (err) {
      // Rollback
      set({ tasks: previousTasks });
      get().showToast(`Failed to update subtask: ${err.message}`, 'error');
    }
  },

  deleteSubtask: async (taskId, subtaskId) => {
    const previousTasks = [...get().tasks];
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task._id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.filter((sub) => sub._id !== subtaskId),
        };
      }),
    }));

    try {
      await taskApi.deleteSubtask(taskId, subtaskId);
      get().showToast('Subtask deleted', 'info');
    } catch (err) {
      set({ tasks: previousTasks });
      get().showToast(`Failed to delete subtask: ${err.message}`, 'error');
    }
  },
}));
