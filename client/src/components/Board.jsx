import React, { useState } from 'react';
import { useTaskStore } from '../store/useTaskStore.js';
import { Column } from './Column.jsx';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export const Board = () => {
  const { tasks } = useTaskStore();
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (e, task) => {
    setDraggedTaskId(task._id);
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.setData('sourceColumn', task.columnId);
    e.dataTransfer.setData('sourcePosition', task.position.toString());
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((task) => task.columnId === col.id)
            .sort((a, b) => a.position - b.position);

          return (
            <Column
              key={col.id}
              columnId={col.id}
              tasks={colTasks}
              draggedTaskId={draggedTaskId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>
    </main>
  );
};
