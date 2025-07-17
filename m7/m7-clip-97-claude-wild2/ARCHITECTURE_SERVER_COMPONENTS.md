# Todo App Architecture Implementation

This document describes the actual implementation of the server/client component architecture.

## Implementation Decisions

### 1. Adjusted Architecture

Due to Next.js constraints where server components cannot be imported by client components, we made the following adjustments:

- **ThemedAppShell** is now a client component that renders the entire app shell
- Static content (header, footer structure) is rendered within this client component
- Client islands (HeaderActions, TodoStats, FooterActions) are embedded directly

### 2. Component Structure

```
src/
├── app/
│   ├── layout.js (Server Component - sets up HTML structure)
│   └── page.jsx (Server Component - renders todo section)
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
│       ├── server/
│       │   ├── TodoSection.js
│       │   ├── TodoToolbar.js
│       │   ├── TodoFilters.js
│       │   ├── TodoSearch.js
│       │   ├── TodoListContainer.js
│       │   └── TodoInput.js
│       │
│       └── client/
│           ├── FilterButtons.js
│           ├── SearchInput.js
│           ├── TodoList.js
│           ├── TodoItem.js
│           ├── DragDropWrapper.js
│           └── AddTodoForm.js
```

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
2. **Duplicate Structure**: Some HTML structure is in the client component rather than server components
3. **Multiple Providers**: TodoDataProvider is instantiated twice (main section and footer)

## Running the Application

```bash
npm run dev
```

The application demonstrates:
- Server-rendered page structure
- Client-side theme switching
- Interactive todo management
- Minimal client-side JavaScript where possible