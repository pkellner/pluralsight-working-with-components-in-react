'use client';
/**
 * TodoStateManager Component
 * 
 * This is a CLIENT COMPONENT that manages all todo-related state.
 * It must be a client component because:
 * 1. It uses React hooks (useState, useTransition)
 * 2. It manages interactive state for filters and search
 * 3. It handles state updates from user interactions
 * 
 * This component encapsulates all the state management logic that was
 * previously in the App component, and composes the server and client
 * components together to build the todo section.
 */

import { useState, useTransition } from 'react';
import FilterButtons from './FilterButtons';
import SearchInput from './SearchInput';
import TodoList from './TodoList';
import AddTodoForm from './AddTodoForm';
import TodoDataProvider from '../../providers/TodoDataProvider';

export default function TodoStateManager() {
  // State for filtering and searching todos
  const [displayStatus, setDisplayStatus] = useState("all"); // all, pending, completed
  const [important, setImportant] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  // Use transition for better performance during state updates
  const [isPending, startTransition] = useTransition();

  return (
    <section>
      <TodoDataProvider>
        <div>
          {/* Toolbar with navbar structure */}
          <nav className="navbar navbar-expand">
            <div className="container-fluid">
              <ul className="navbar-nav">
                <div className="filters">
                  <li className="nav-item">
                    <SearchInput
                      searchText={searchText}
                      setSearchText={setSearchText}
                      startTransition={startTransition}
                    />
                  </li>
                  <li className="nav-item">
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                      style={{
                        visibility: isPending ? "visible" : "hidden",
                      }}
                    ></span>
                  </li>
                  {/* Filter nav links */}
                  <FilterButtons
                    displayStatus={displayStatus}
                    setDisplayStatus={setDisplayStatus}
                    important={important}
                    setImportant={setImportant}
                    startTransition={startTransition}
                  />
                </div>
              </ul>
            </div>
          </nav>
          
          {/* Add form before the list */}
          <div className="form">
            <AddTodoForm />
          </div>
          
          {/* Todo list */}
          <TodoList
            displayStatus={displayStatus}
            important={important}
            searchText={searchText}
          />
        </div>
      </TodoDataProvider>
    </section>
  );
}