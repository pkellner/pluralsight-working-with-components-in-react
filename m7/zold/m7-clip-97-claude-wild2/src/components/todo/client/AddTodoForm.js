'use client';
/**
 * AddTodoForm Component
 * 
 * This is a CLIENT COMPONENT that handles adding new todos.
 * It must be a client component because:
 * 1. It handles form submission
 * 2. It manages local state (input value, important flag)
 * 3. It uses React hooks
 * 4. It needs access to createTodo method from context
 * 
 * This component provides the form for creating new todo items
 * with text input and important flag option.
 */

import { useContext, useState } from 'react';
import { ToDosDataContext } from '../../../contexts/ToDosDataContext';

export default function AddTodoForm() {
  // Access createTodo method from context
  const { createTodo } = useContext(ToDosDataContext);
  
  // Local state for form inputs
  const [todoText, setTodoText] = useState('');

  const add = (todoText) => {
    createTodo({
      todoText: todoText,
      completed: false,
      important: false,
    });
  };

  return (
    <div className="showing">
      <div className="input-group">
        <div className="form-floating">
          <input
            value={todoText}
            onChange={(e) => {
              setTodoText(e.target.value);
            }}
            placeholder="Enter To-do..."
            className="form-control"
            id="addTodo"
          />
          <label htmlFor="addTodo">Enter To-do...</label>
        </div>
        <button
          disabled={todoText.length === 0}
          className="btn btn-theme-primary"
          id="push"
          onClick={() => {
            add(todoText);
            setTodoText("");
          }}
        >
          <i className="fas fa-plus"></i> Add Task
        </button>
      </div>
    </div>
  );
}