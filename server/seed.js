import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from './models/Task.js';

dotenv.config();

const sampleTasks = [
  // --- COLUMN: TO DO ---
  {
    title: 'Audit WCAG 2.1 Color Contrast Ratios',
    description: 'Ensure all primary buttons, badges, and dark mode modal elements strictly meet AA/AAA 4.5:1 contrast standards.',
    priority: 'High',
    columnId: 'todo',
    position: 0,
    subtasks: [
      { title: 'Check dark mode badge text against card backgrounds', isCompleted: false },
      { title: 'Verify modal backdrop blur and text readability', isCompleted: false },
      { title: 'Test button focus ring visibility with keyboard tab navigation', isCompleted: false },
    ],
  },
  {
    title: 'Implement Redis Caching Layer for Task Board',
    description: 'Cache column task listings to reduce MongoDB read load under high concurrent user queries.',
    priority: 'Medium',
    columnId: 'todo',
    position: 1,
    subtasks: [
      { title: 'Draft cache key invalidation strategy for card moves', isCompleted: false },
      { title: 'Setup local Redis container in docker-compose', isCompleted: false },
    ],
  },
  {
    title: 'Design Mobile Drag-and-Drop Touch Handles',
    description: 'Add dedicated touch-friendly move controls and haptic feedback triggers for responsive mobile views.',
    priority: 'Low',
    columnId: 'todo',
    position: 2,
    subtasks: [
      { title: 'Evaluate mobile touch gesture tolerances', isCompleted: false },
      { title: 'Create quick-move bottom sheet for small screens', isCompleted: false },
    ],
  },

  // --- COLUMN: IN PROGRESS ---
  {
    title: 'Architect Optimistic Rollback & Version Guard',
    description: 'Defend against race conditions when cards are moved rapidly across columns over 3G high-latency networks.',
    priority: 'High',
    columnId: 'in-progress',
    position: 0,
    subtasks: [
      { title: 'Capture immutable client state snapshot before API dispatch', isCompleted: true },
      { title: 'Add rollback restore handler on simulated 500 network drops', isCompleted: true },
      { title: 'Implement FIFO request queue to prevent out-of-order writes', isCompleted: false },
    ],
  },
  {
    title: 'Refactor Nested Subtask Progress Calculations',
    description: 'Display an animated percentage progress bar reflecting completed checklist items on every card.',
    priority: 'Medium',
    columnId: 'in-progress',
    position: 1,
    subtasks: [
      { title: 'Build smooth animated CSS transition for progress bar', isCompleted: true },
      { title: 'Expose quick subtask toggle directly from card view', isCompleted: false },
      { title: 'Calculate dynamic color badge (emerald, amber, blue)', isCompleted: true },
    ],
  },
  {
    title: 'Profile MongoDB Positional Index Performance',
    description: 'Benchmark bulkWrite positional shift queries with compound index (columnId: 1, position: 1).',
    priority: 'Low',
    columnId: 'in-progress',
    position: 2,
    subtasks: [
      { title: 'Run explain() on reordering updateMany queries', isCompleted: true },
      { title: 'Confirm index prefix utilization without table scans', isCompleted: false },
    ],
  },

  // --- COLUMN: DONE ---
  {
    title: 'Configure Zero-Flicker Theme Engine',
    description: 'Hydrate user color preference from localStorage before first DOM paint to prevent flash of unstyled content.',
    priority: 'High',
    columnId: 'done',
    position: 0,
    subtasks: [
      { title: 'Inject theme evaluation script in index.html head', isCompleted: true },
      { title: 'Synchronize theme with Tailwind dark class toggle', isCompleted: true },
      { title: 'Persist user selection across browser reload cycles', isCompleted: true },
    ],
  },
  {
    title: 'Build Atomic Position Reordering REST API',
    description: 'Implement PATCH /api/tasks/:id/move using atomic bulkWrite and positional operators instead of array overwrites.',
    priority: 'High',
    columnId: 'done',
    position: 1,
    subtasks: [
      { title: 'Implement same-column positional displacement ($inc)', isCompleted: true },
      { title: 'Implement cross-column atomic position shifts', isCompleted: true },
      { title: 'Add simulated 500 error header hook for test suite', isCompleted: true },
    ],
  },
  {
    title: 'Establish MERN Folder Architecture & Git Conventions',
    description: 'Structure client/ and server/ isolation with SOLID controllers, models, and semantic Git feature branches.',
    priority: 'Medium',
    columnId: 'done',
    position: 2,
    subtasks: [
      { title: 'Initialize separate client and server package environments', isCompleted: true },
      { title: 'Configure environment variables and connection pools', isCompleted: true },
    ],
  },
];

async function seedDatabase() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
  
  console.log('----------------------------------------------------');
  console.log('🚀 [TaskFlow Seeder] Starting database reset...');
  console.log(`Connecting to: ${mongoURI}`);

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB.');

    console.log('🧹 Purging existing tasks collection...');
    const deleteResult = await Task.deleteMany({});
    console.log(`Removed ${deleteResult.deletedCount} existing documents.`);

    console.log('🌱 Inserting 9 realistic Kanban tasks across all columns...');
    const inserted = await Task.insertMany(sampleTasks);
    console.log(`✅ Successfully seeded ${inserted.length} sample tasks!`);

    console.log('\nSummary of seeded cards:');
    const cols = ['todo', 'in-progress', 'done'];
    for (const col of cols) {
      const colTasks = inserted.filter((t) => t.columnId === col);
      console.log(`  📁 [${col.toUpperCase()}] (${colTasks.length} cards)`);
      colTasks.forEach((t) => {
        const subCount = t.subtasks.length;
        const doneCount = t.subtasks.filter((s) => s.isCompleted).length;
        console.log(`    - Pos ${t.position}: [${t.priority}] "${t.title}" (${doneCount}/${subCount} subtasks)`);
      });
    }

    console.log('----------------------------------------------------');
    console.log('🎉 Database seeding complete! Ready for evaluation.');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder Error] Failed to seed database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
