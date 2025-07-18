'use client';
/**
 * TodoItem Component
 * 
 * This is a CLIENT COMPONENT that renders individual todo items.
 * It must be a client component because:
 * 1. It handles user interactions (checkbox, edit, delete)
 * 2. It manages local state (edit mode)
 * 3. It uses React hooks
 * 4. It needs access to todo methods from context
 * 
 * This component handles all interactions for a single todo item
 * including completion toggle, editing, and deletion.
 * 
 * NOTE: This component receives a `textElement` prop that contains a
 * server-rendered React element. When provided, this element was rendered
 * on the server by TodoTextRenderer, demonstrating true server component usage.
 * The server component processes text (sanitization, truncation) on the server
 * and passes the rendered JSX to this client component as a prop.
 */

import { useContext, useState, memo } from 'react';
import { ToDosDataContext } from '../../../contexts/ToDosDataContext';
import ToDoEditForm from '../../todo/ToDoEditForm';
import ErrorBoundary from '../../common/ErrorBoundary';
import TodoTextDisplay from '../shared/TodoTextDisplay';

function TodoItemInner({ todoItem, textElement }) {
  // Access todo methods from context
  const { updateTodo, deleteTodo } = useContext(ToDosDataContext);
  
  // Local state for edit mode
  const [editMode, setEditMode] = useState(false);

  const handleCheckboxChange = () => {
    updateTodo({
      ...todoItem,
      completed: !todoItem.completed,
    });
  };

  const handleToggleImportant = () => {
    updateTodo({
      ...todoItem,
      important: !todoItem.important,
    });
  };

  const handleDelete = () => {
    const response = window.confirm("Delete this todo?");
    if (response) {
      deleteTodo(todoItem.id);
    }
  };

  const handleSaveEdit = (updatedText) => {
    updateTodo({
      ...todoItem,
      todoText: updatedText,
    });
    setEditMode(false);
  };

  return (
    <div
      key={todoItem.id}
      className={todoItem.completed ? "single-task completed" : "single-task"}
    >
      {editMode ? (
        <ToDoEditForm
          todoText={todoItem.todoText}
          onSave={handleSaveEdit}
          onCancel={() => setEditMode(false)}
        />
      ) : (
        <>
          <div
            onClick={() => {
              return handleCheckboxChange();
            }}
          >
            {textElement || (
              <TodoTextDisplay 
                text={todoItem.todoText?.slice(0, 60)} 
                important={todoItem.important}
              />
            )}
          </div>

          <div className="task-actions">
            <button
              className="btn edit"
              title="Edit"
              onClick={() => setEditMode(true)}
            >
              <i className="fas fa-pencil-alt"></i>
            </button>

            <button
              className="btn delete"
              title="Delete"
              onClick={handleDelete}
            >
              <i className="far fa-trash-alt"></i>
            </button>
          </div>
          
          {todoItem.sequence !== undefined && (
            <span className="sequence-badge no-underline">
              #{todoItem.sequence}
            </span>
          )}
        </>
      )}
    </div>
  );
}

// Error UI component for the error boundary
const TodoItemErrorBoundary = (props) => {
  return (
    <div className="single-task text-bg-danger">
      <b>Error displaying todo item</b>
    </div>
  );
};

// Main TodoItem component with error boundary
export default function TodoItem(props) {
  return (
    <ErrorBoundary errorUI={<TodoItemErrorBoundary {...props} />}>
      <TodoItemInner {...props} />
    </ErrorBoundary>
  );
}