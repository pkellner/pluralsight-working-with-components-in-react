'use client';
/**
 * TodoDataProvider Component
 * 
 * This is a CLIENT COMPONENT that provides todo data context.
 * It's separate from ClientProviders because todo data is only needed
 * in specific parts of the app (main todo section and footer).
 * 
 * This allows us to scope the data fetching and state management
 * to only the components that need it.
 */

import { TodosDataProvider } from '../../contexts/ToDosDataContext';

export default function TodoDataProvider({ children }) {
  return (
    <TodosDataProvider>
      {children}
    </TodosDataProvider>
  );
}