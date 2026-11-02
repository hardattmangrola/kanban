/**
 * API Service Client for TaskFlow
 * Single Responsibility: handles all HTTP network communication with the backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Standardized Fetch wrapper with error handling and simulated failure support
 */
async function request(endpoint, options = {}, simulateError = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (simulateError) {
    headers['x-simulate-error'] = 'true';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || `HTTP ${response.status}: Network request failed`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const taskApi = {
  // Fetch all tasks
  getAllTasks: () => request('/tasks'),

  // Create a new task
  createTask: (taskData) =>
    request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  // Update task details (title, description, priority)
  updateTask: (id, taskData) =>
    request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),

  // Move or reorder a task within or across columns
  moveTask: (id, movePayload, simulateError = false) =>
    request(
      `/tasks/${id}/move`,
      {
        method: 'PATCH',
        body: JSON.stringify({ ...movePayload, simulateError }),
      },
      simulateError
    ),

  // Delete a task
  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Add a subtask
  addSubtask: (taskId, title) =>
    request(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  // Toggle or update subtask
  updateSubtask: (taskId, subtaskId, updateData) =>
    request(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    }),

  // Delete subtask
  deleteSubtask: (taskId, subtaskId) =>
    request(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    }),
};
