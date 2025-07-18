/**
 * HomePage Component
 * 
 * This is a SERVER COMPONENT that serves as the main page of the app.
 * It remains a server component because:
 * 1. It only renders the page structure
 * 2. It doesn't use any hooks or browser APIs
 * 3. It composes server and client components together
 * 
 * This component demonstrates the server/client component architecture
 * by composing static structure (server components) with interactive
 * elements (client components).
 */

import ThemedAppShell from '../components/layout/client/ThemedAppShell';
import HeaderActions from '../components/layout/client/HeaderActions';
import TodoDataProvider from '../components/providers/TodoDataProvider';
import TodoStats from '../components/layout/client/TodoStats';
import FooterActions from '../components/layout/client/FooterActions';
import TodoStateManager from '../components/todo/client/TodoStateManager';
import TodoTextRenderer from '../components/todo/server/TodoTextRenderer';
import { readFileSync } from 'fs';
import path from 'path';

export default function HomePage() {
  const layoutVersion = "Layout Version 2.0";
  
  // Read todos from db.json at build time (server-side)
  const dbPath = path.join(process.cwd(), 'db.json');
  const dbData = JSON.parse(readFileSync(dbPath, 'utf8'));
  const todos = dbData.todos || [];
  
  // Pre-render all todo text elements on the server
  const todoTextElements = {};
  todos.forEach(todo => {
    todoTextElements[todo.id] = (
      <TodoTextRenderer 
        todoText={todo.todoText}
        important={todo.important}
      />
    );
  });

  return (
    <ThemedAppShell>
      {/* Static header structure - server component content */}
      <header>
        <h2>To-do List</h2>
        {/* HeaderActions is a client component for theme toggle */}
        <HeaderActions layoutVersion={layoutVersion} />
      </header>

      {/* Todo section with state management */}
      <TodoStateManager preRenderedTextElements={todoTextElements} />

      {/* Static footer structure - server component content */}
      <footer className="text-center">
        <div className="stats">
          {/* FooterActions and TodoStats need todo data, so wrap in provider */}
          <TodoDataProvider>
            <FooterActions />
            <TodoStats />
          </TodoDataProvider>
        </div>
      </footer>
    </ThemedAppShell>
  );
}
