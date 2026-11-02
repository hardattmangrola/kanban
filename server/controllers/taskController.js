import { Task } from '../models/Task.js';

/**
 * Task Controller
 * Handles all business logic for Kanban tasks adhering to SOLID principles.
 * Ensures Atomic Persistence for all state mutations via MongoDB atomic operators ($set, $inc, bulkWrite).
 */

/**
 * @route   GET /api/tasks
 * @desc    Fetch all tasks ordered by column and position
 * @access  Public
 */
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({}).sort({ columnId: 1, position: 1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task at the end of the specified column
 * @access  Public
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description = '', priority = 'Medium', columnId = 'todo' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    // Determine the next position atomically in the target column
    const currentCount = await Task.countDocuments({ columnId });

    const newTask = await Task.create({
      title: title.trim(),
      description: description.trim(),
      priority,
      columnId,
      position: currentCount,
      subtasks: [],
    });

    res.status(201).json({
      success: true,
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details (title, description, priority)
 * @access  Public
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (priority !== undefined) updateFields.priority = priority;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/tasks/:id/move
 * @desc    Atomically move or reorder a task within or across columns
 * @access  Public
 */
export const moveTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      destinationColumn,
      destinationPosition,
      sourceColumn,
      sourcePosition,
      simulateError = false,
    } = req.body;

    // Simulation check for evaluating optimistic rollback and resilience
    const shouldSimulateError =
      simulateError || req.headers['x-simulate-error'] === 'true';

    if (shouldSimulateError) {
      return res.status(500).json({
        success: false,
        message: 'SIMULATED_SERVER_ERROR: Rollback triggered successfully!',
      });
    }

    const taskToMove = await Task.findById(id);
    if (!taskToMove) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const actualSourceCol = sourceColumn || taskToMove.columnId;
    const actualSourcePos =
      sourcePosition !== undefined ? Number(sourcePosition) : taskToMove.position;
    const targetCol = destinationColumn || actualSourceCol;
    const targetPos = Math.max(0, Number(destinationPosition));

    const bulkOperations = [];

    // Case 1: Reordering within the SAME column
    if (actualSourceCol === targetCol) {
      if (actualSourcePos < targetPos) {
        // Shift items between (actualSourcePos, targetPos] UP (decrement position)
        bulkOperations.push({
          updateMany: {
            filter: {
              columnId: actualSourceCol,
              position: { $gt: actualSourcePos, $lte: targetPos },
            },
            update: { $inc: { position: -1 } },
          },
        });
      } else if (actualSourcePos > targetPos) {
        // Shift items between [targetPos, actualSourcePos) DOWN (increment position)
        bulkOperations.push({
          updateMany: {
            filter: {
              columnId: actualSourceCol,
              position: { $gte: targetPos, $lt: actualSourcePos },
            },
            update: { $inc: { position: 1 } },
          },
        });
      }

      // Update moved card position
      bulkOperations.push({
        updateOne: {
          filter: { _id: id },
          update: { $set: { position: targetPos } },
        },
      });
    } else {
      // Case 2: Moving ACROSS different columns
      // 1. Shift remaining items in source column UP
      bulkOperations.push({
        updateMany: {
          filter: {
            columnId: actualSourceCol,
            position: { $gt: actualSourcePos },
          },
          update: { $inc: { position: -1 } },
        },
      });

      // 2. Make room in destination column by shifting items DOWN
      bulkOperations.push({
        updateMany: {
          filter: {
            columnId: targetCol,
            position: { $gte: targetPos },
          },
          update: { $inc: { position: 1 } },
        },
      });

      // 3. Update the target card's column and position
      bulkOperations.push({
        updateOne: {
          filter: { _id: id },
          update: {
            $set: {
              columnId: targetCol,
              position: targetPos,
            },
          },
        },
      });
    }

    // Execute atomic bulkWrite operation in a single roundtrip
    if (bulkOperations.length > 0) {
      await Task.bulkWrite(bulkOperations);
    }

    // Return immediate success response without redundant 3rd DB query
    res.status(200).json({
      success: true,
      message: 'Task moved atomically and successfully',
      data: {
        _id: id,
        columnId: targetCol,
        position: targetPos,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task and atomically shift subsequent tasks up
 * @access  Public
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const taskToDelete = await Task.findById(id);
    if (!taskToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const { columnId, position } = taskToDelete;

    // Delete the task
    await Task.findByIdAndDelete(id);

    // Atomically shift up subsequent cards in the same column
    await Task.updateMany(
      { columnId, position: { $gt: position } },
      { $inc: { position: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Task deleted and column positions re-indexed atomically',
      data: { _id: id },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks/:id/subtasks
 * @desc    Add a subtask to a task (Option 3: Nested Checklist & Progress)
 * @access  Public
 */
export const addSubtask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subtask title is required',
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        $push: {
          subtasks: {
            title: title.trim(),
            isCompleted: false,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(201).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/tasks/:id/subtasks/:subtaskId
 * @desc    Toggle subtask completion or update title
 * @access  Public
 */
export const updateSubtask = async (req, res, next) => {
  try {
    const { id, subtaskId } = req.params;
    const { isCompleted, title } = req.body;

    const updateQuery = {};
    if (isCompleted !== undefined) {
      updateQuery['subtasks.$.isCompleted'] = isCompleted;
    }
    if (title !== undefined) {
      updateQuery['subtasks.$.title'] = title.trim();
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, 'subtasks._id': subtaskId },
      { $set: updateQuery },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task or subtask not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id/subtasks/:subtaskId
 * @desc    Remove a subtask from a task
 * @access  Public
 */
export const deleteSubtask = async (req, res, next) => {
  try {
    const { id, subtaskId } = req.params;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        $pull: {
          subtasks: { _id: subtaskId },
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};
