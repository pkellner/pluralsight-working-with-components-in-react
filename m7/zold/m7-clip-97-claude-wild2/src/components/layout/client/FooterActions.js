'use client';
/**
 * FooterActions Component
 * 
 * This is a CLIENT COMPONENT that contains interactive footer elements.
 * It must be a client component because:
 * 1. It handles user interactions (button clicks)
 * 2. It uses React hooks (useContext)
 * 3. It needs access to todo data and methods from context
 * 4. It shows dynamic loading state
 * 
 * This component handles refresh and clear completed functionality.
 */

import { useContext } from 'react';
import { ToDosDataContext } from '../../../contexts/ToDosDataContext';

export default function FooterActions() {
  // Access todo data and methods from context
  const { todoList, deleteTodo, reFetch, loadingStatus } =
    useContext(ToDosDataContext);

  const handleClearCompleted = () => {
    const response = window.confirm("Clear Completed Todos?");
    if (response) {
      let completedIds = todoList
        .filter((todoItem) => {
          return todoItem.completed;
        })
        .map((rec) => rec.id);
      deleteTodo(completedIds);
    }
  };

  return (
    <>
      <button
        title="Refresh List"
        className="btn btn-theme-primary"
        onClick={() => {
          reFetch();
        }}
      >
        <i className="fas fa-sync"></i>
      </button>

      <div className="footer-refresh" title="Refreshing">
        {loadingStatus === "loading" ? (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        ) : (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
            hidden
          ></span>
        )}
      </div>

      <div className="clear-completed">
        <button
          onClick={handleClearCompleted}
          className="btn btn-theme-danger btn-md"
        >
          Clear Completed
        </button>
      </div>
    </>
  );
}