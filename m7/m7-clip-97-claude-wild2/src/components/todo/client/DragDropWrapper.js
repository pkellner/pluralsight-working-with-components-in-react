'use client';
/**
 * DragDropWrapper Component
 * 
 * This is a CLIENT COMPONENT that provides drag and drop functionality.
 * It must be a client component because:
 * 1. It uses React hooks (useContext)
 * 2. It needs access to todo data and methods from context
 * 3. It manages drag and drop state
 * 4. It handles browser drag and drop events
 * 
 * This component wraps the todo list with drag and drop context
 * and uses the existing DragDropToDoList component.
 */

import { useContext } from 'react';
import { ToDosDataContext } from '../../../contexts/ToDosDataContext';
import DragDropContextProvider, { DragDropToDoList } from '../../../contexts/DragDropContextProvider';

export default function DragDropWrapper({ items, fullList, children }) {
  // Access updateTodo method from context
  const { updateTodo } = useContext(ToDosDataContext);

  // Handle items change from drag and drop
  const handleItemsChange = (newItems) => {
    // Update the sequence of all items
    newItems.forEach((item, index) => {
      if (item.sequence !== index + 1) {
        updateTodo({
          ...item,
          sequence: index + 1,
        });
      }
    });
  };

  return (
    <DragDropContextProvider 
      items={items} 
      onItemsChange={handleItemsChange}
      fullList={fullList}
    >
      <DragDropToDoList>
        {children}
      </DragDropToDoList>
    </DragDropContextProvider>
  );
}