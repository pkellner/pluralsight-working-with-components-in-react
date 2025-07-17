# Todo App Architecture Implementation

This document describes the actual implementation of the server/client component architecture.

## Implementation Decisions

### 1. Adjusted Architecture

Due to Next.js constraints where server components cannot be imported by client components, we made the following adjustments:

- **ThemedAppShell** is a client component that renders the app shell with theme support
- The main page structure is composed in the server component `page.jsx`
- Client components (HeaderActions, TodoStats, FooterActions) handle all interactive elements
- TodoStateManager centralizes all todo-related state management and UI composition

### 2. Component Structure

```
src/
├── app/
│   ├── layout.js (Server Component - sets up HTML structure)
│   └── page.jsx (Server Component - renders page structure)
│
├── components/
│   ├── layout/
│   │   └── client/
│   │       ├── ThemedAppShell.js (Main shell with theme)
│   │       ├── HeaderActions.js (Theme toggle)
│   │       ├── TodoStats.js (Todo statistics)
│   │       └── FooterActions.js (Action buttons)
│   │
│   ├── providers/
│   │   ├── ClientProviders.js (Theme provider wrapper)
│   │   └── TodoDataProvider.js (Todo data provider)
│   │
│   └── todo/
│       └── client/
│           ├── TodoStateManager.js (Central state management)
│           ├── FilterButtons.js (Filter nav links)
│           ├── SearchInput.js (Search input)
│           ├── TodoList.js (Todo list with filtering)
│           ├── TodoItem.js (Individual todo item)
│           ├── DragDropWrapper.js (Drag and drop functionality)
│           └── AddTodoForm.js (Add todo form)
```

Note: The server components in `todo/server/` were removed during implementation as they added unnecessary wrapper divs that broke the CSS layout. The structure is now simpler with server components only at the app level.

### 3. Data Flow

1. **Theme Context**: Provided globally via ClientProviders
2. **Todo Data Context**: Provided locally where needed (todo section and footer)
3. **Component Boundaries**: Clear separation between static structure and interactive elements

### 4. Key Patterns Used

#### Server Components
- Used for page structure and static content containers
- Cannot use hooks, state, or event handlers
- Can fetch data directly (though not implemented in this demo)

#### Client Components
- Used for all interactive elements
- Can use React hooks and browser APIs
- Marked with 'use client' directive

#### Context Providers
- ThemeProvider: Global theme management
- TodoDataProvider: Scoped to components that need todo data

### 5. Benefits Achieved

1. **Reduced JavaScript Bundle**: Only interactive components ship JavaScript
2. **Clear Architecture**: Easy to understand what runs where
3. **Maintainable Code**: Well-commented components for teaching
4. **Flexible Structure**: Easy to add new features following the pattern

### 6. Trade-offs

1. **ThemedAppShell as Client Component**: Since the theme affects the entire shell, we made it a client component
2. **Simplified Structure**: Server components for todo section were removed to maintain CSS layout integrity
3. **Multiple Providers**: TodoDataProvider is instantiated twice (main section and footer) for proper scoping

## Running the Application

```bash
npm run dev
```

The application demonstrates:
- Server-rendered page structure
- Client-side theme switching
- Interactive todo management
- Minimal client-side JavaScript where possible