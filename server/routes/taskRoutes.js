import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from '../controllers/taskController.js';

const router = express.Router();

/**
 * Task Routes adhering to RESTful conventions
 */
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/move')
  .patch(moveTask);

// Wildcard Checklist subtask routes
router.route('/:id/subtasks')
  .post(addSubtask);

router.route('/:id/subtasks/:subtaskId')
  .patch(updateSubtask)
  .delete(deleteSubtask);

export default router;
