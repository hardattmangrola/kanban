import React, { useState, useEffect, useCallback } from 'react';
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

  const handleDragStart = useCallback((e, task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.setData('sourceColumn', task.columnId);
    e.dataTransfer.setData('sourcePosition', task.position.toString());

    // Defer setting draggedTaskId by 1 frame so the browser captures a crisp preview first
    requestAnimationFrame(() => {
      setDraggedTaskId(task._id);
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
  }, []);

  // Global safety net to clear draggedTaskId if mouse is released anywhere
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggedTaskId(null);
    };
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, []);

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
