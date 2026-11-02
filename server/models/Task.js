import mongoose from 'mongoose';

/**
 * Subtask Sub-schema for Option 3: Nested Checklist & Progress
 */
const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true,
      maxlength: [200, 'Subtask title cannot exceed 200 characters'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: true,
  }
);

/**
 * Task Schema
 * Defines the core structure for Kanban cards with strict validation
 * and index optimization for fast positional and column queries.
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Task title cannot be empty'],
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be either Low, Medium, or High',
      },
      default: 'Medium',
      required: true,
    },
    columnId: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Column ID must be either todo, in-progress, or done',
      },
      default: 'todo',
      required: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Position must be a non-negative integer'],
    },
    subtasks: {
      type: [subtaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for efficient positional ordering queries per column
taskSchema.index({ columnId: 1, position: 1 });

export const Task = mongoose.model('Task', taskSchema);
