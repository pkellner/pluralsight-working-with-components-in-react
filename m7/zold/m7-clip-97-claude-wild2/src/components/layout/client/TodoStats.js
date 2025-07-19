'use client';
/**
 * TodoStats Component
 * 
 * This is a CLIENT COMPONENT that displays todo statistics.
 * It must be a client component because:
 * 1. It uses React hooks (useContext)
 * 2. It needs access to todo data from context
 * 3. The statistics update dynamically as todos change
 * 
 * This component shows counts of total, incomplete, and important todos.
 */

import { useContext } from 'react';
import { ToDosDataContext } from '../../../contexts/ToDosDataContext';

export default function TodoStats() {
  // Access todo data from context
  const { todoList } = useContext(ToDosDataContext);

  // Calculate statistics
  const totalItems = todoList?.length || 0;
  const notCompletedItems = todoList?.filter((r) => !r.completed).length || 0;
  const importantItems = todoList?.filter(
    (r) => !r.completed && r.important,
  ).length || 0;

  return (
    <div className="quick-stats">
      {todoList?.length > 0 ? (
        <p>
          <span className="badge text-bg-secondary">{totalItems}</span>{" "}
          Items:{" "}
          <span className="badge theme-main-bg">{notCompletedItems}</span>{" "}
          not completed of which{" "}
          <span className="badge btn-theme-danger">{importantItems}</span>{" "}
          are important
        </p>
      ) : (
        <p className="hidden-block">
          <span className="badge text-bg-secondary">x</span> Items:{" "}
          <span className="badge theme-main-bg">x</span> not completed of
          which <span className="badge btn-theme-danger">x</span> are
          important
        </p>
      )}
    </div>
  );
}