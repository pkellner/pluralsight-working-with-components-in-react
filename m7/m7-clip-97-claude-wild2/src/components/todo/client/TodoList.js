'use client';
/**
 * TodoList Component
 * 
 * This is a CLIENT COMPONENT that renders the list of todos.
 * It must be a client component because:
 * 1. It uses React hooks (useContext, useMemo)
 * 2. It accesses todo data from context
 * 3. It handles drag and drop functionality
 * 4. It manages dynamic rendering based on filters
 * 
 * This component filters and renders todos based on current
 * display settings and search criteria.
 */

import { useContext, useMemo } from 'react';
import { ToDosDataContext } from '../../../contexts/ToDosDataContext';
import DragDropWrapper from './DragDropWrapper';
import TodoItem from './TodoItem';
import ErrorBoundary from '../../common/ErrorBoundary';

export default function TodoList({ displayStatus, important, searchText }) {
  // Access todo data from context
  const { todoList, loadingStatus } = useContext(ToDosDataContext);

  // Filter todos based on current settings
  const filteredTodos = useMemo(() => {
    if (!todoList) return [];
    
    return todoList
      .filter((todoItem) => {
        // Filter by completion status
        if (displayStatus === "pending" && todoItem.completed) return false;
        if (displayStatus === "completed" && !todoItem.completed) return false;
        
        // Filter by important flag
        if (important && !todoItem.important) return false;
        
        // Filter by search text
        if (searchText && searchText.length > 0) {
          return todoItem.todoText
            .toLowerCase()
            .includes(searchText.toLowerCase());
        }
        
        return true;
      })
      .sort((a, b) => a.sequence - b.sequence);
  }, [todoList, displayStatus, important, searchText]);

  // Show loading state
  if (loadingStatus === "loading") {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadingStatus === "errored") {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading todos. Please try refreshing.
      </div>
    );
  }

  // Show empty state
  if (filteredTodos.length === 0) {
    return (
      <div className="text-center text-muted p-4">
        {searchText ? "No todos match your search." : "No todos to display."}
      </div>
    );
  }

  // Render todos with drag and drop wrapper
  return (
    <div className="tasks">
      <ErrorBoundary>
        <DragDropWrapper items={filteredTodos} fullList={todoList}>
          <TodoItem />
        </DragDropWrapper>
      </ErrorBoundary>
    </div>
  );
}