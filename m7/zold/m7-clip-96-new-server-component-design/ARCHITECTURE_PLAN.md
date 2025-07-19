# Todo App Architecture Plan - Server/Client Component Design

## Overview
This document outlines an architecture for a Next.js 15 Todo application that maximizes server-side rendering while maintaining interactive functionality. The goal is to render as much static content (headers, footers, layout) on the server while keeping dynamic content (todos, interactions) on the client.

## Core Principles
1. **Server-First Approach**: Default to server components unless client-side interactivity is required
2. **Data Locality**: Keep data fetching close to where it's consumed
3. **Minimal Client Boundaries**: Create the smallest possible client component boundaries
4. **Progressive Enhancement**: Server-rendered structure with client-side enhancements

## Component Hierarchy

```
app/
├── layout.tsx (Server Component)
│   └── <ThemeProvider> (Client Component - wraps entire app)
│       └── <AppShell> (Server Component - receives theme via prop)
│           ├── <Header> (Server Component - receives theme via prop)
│           │   ├── <Logo> (Server Component)
│           │   ├── <Navigation> (Server Component)
│           │   └── <HeaderActions> (Server Component)
│           │       └── <ThemeToggle> (Client Component - accesses ThemeContext)
│           │
│           └── {children}
│
└── page.tsx (Server Component)
    └── <MainContent> (Server Component)
        ├── <TodoSection> (Server Component)
        │   └── <TodoDataProvider> (Client Component - wraps only what needs todo data)
        │       ├── <TodoToolbar> (Server Component)
        │       │   ├── <TodoFilters> (Server Component)
        │       │   │   └── <FilterButtons> (Client Component - accesses/sets TodoContext)
        │       │   └── <TodoSearch> (Server Component)
        │       │       └── <SearchInput> (Client Component - accesses/sets TodoContext)
        │       │
        │       ├── <TodoListContainer> (Server Component)
        │       │   ├── <TodoList> (Server Component)
        │       │   │   └── <TodoItem> (Server Component)
        │       │   │       ├── <TodoCheckbox> (Client Component - accesses TodoContext)
        │       │   │       ├── <TodoText> (Server Component)
        │       │   │       ├── <TodoEditButton> (Client Component - accesses TodoContext)
        │       │   │       └── <TodoDeleteButton> (Client Component - accesses TodoContext)
        │       │   └── <DragDropWrapper> (Client Component - handles drag/drop state)
        │       │
        │       ├── <TodoInput> (Server Component)
        │       │   └── <AddTodoForm> (Client Component - accesses TodoContext)
        │       │
        │       └── <Footer> (Server Component - receives theme via prop)
        │           ├── <FooterLinks> (Server Component)
        │           ├── <FooterStatsContainer> (Server Component)
        │           │   └── <TodoStats> (Client Component - accesses TodoContext)
        │           └── <FooterActionsContainer> (Server Component)
        │               ├── <RefreshButton> (Client Component - accesses TodoContext)
        │               ├── <LoadingSpinner> (Client Component - accesses TodoContext)
        │               └── <ClearCompletedButton> (Client Component - accesses TodoContext)
```

## Key Design Decisions

### 1. Layout Structure
```typescript
// app/layout.tsx - Server Component
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppShell>
          <ClientProviders>
            {children}
          </ClientProviders>
        </AppShell>
      </body>
    </html>
  );
}
```

### 2. Server Components

#### AppShell (Server Component)
- Renders the static shell of the application
- Contains header, footer, and main content area
- No state or interactivity

#### Header (Server Component)
```typescript
// components/layout/Header.tsx
export default function Header() {
  return (
    <header className="app-header">
      <Logo />
      <Navigation />
      <HeaderActions />
    </header>
  );
}
```

#### Footer (Server Component)
```typescript
// components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="app-footer">
      <FooterLinks />
      <div className="footer-interactive">
        <FooterStats />
        <FooterActions />
      </div>
    </footer>
  );
}
```

### 3. Client Component Islands

#### HeaderActions (Client Component)
```typescript
'use client';
// Minimal client boundary for theme toggle and user menu
export default function HeaderActions() {
  return (
    <div className="header-actions">
      <ThemeToggle />
      <UserMenu />
    </div>
  );
}
```

#### FooterStats (Client Component)
```typescript
'use client';
// Subscribes to todo data to show statistics
export default function FooterStats() {
  const { todos } = useTodoData();
  return <TodoStatistics todos={todos} />;
}
```

#### FooterActions (Client Component)
```typescript
'use client';
// Interactive buttons that need todo context
export default function FooterActions() {
  const { refetch, clearCompleted } = useTodoData();
  return (
    <div className="footer-actions">
      <RefreshButton onRefresh={refetch} />
      <ClearCompletedButton onClear={clearCompleted} />
    </div>
  );
}
```

### 4. Data Flow Architecture

#### Server-Side Data
- Static content (navigation links, footer links, app metadata)
- Initial todo data could be fetched server-side and passed as props

#### Client-Side Data
- Todo state management via Context API
- Theme state via Theme Context
- Real-time updates and interactions

### 5. Provider Strategy

```typescript
// components/providers/ClientProviders.tsx
'use client';

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
```

```typescript
// components/providers/TodoDataProvider.tsx
'use client';

// Separate provider that wraps only components that need todo data
export default function TodoDataProvider({ children }) {
  // Todo state management logic
  return (
    <TodoContext.Provider value={...}>
      {children}
    </TodoContext.Provider>
  );
}
```

### 6. Page Structure

```typescript
// app/page.tsx - Server Component
export default function HomePage() {
  return (
    <main className="todo-container">
      <h1>My Todos</h1>
      <TodoDataProvider>
        <TodoApp />
        {/* FooterStats and FooterActions consume TodoDataProvider */}
      </TodoDataProvider>
    </main>
  );
}
```

## Benefits of This Architecture

1. **Maximum Server Rendering**: Header structure, footer structure, and layout are all server-rendered
2. **Minimal JavaScript**: Only interactive elements require client-side JavaScript
3. **Better SEO**: More content is available on initial page load
4. **Improved Performance**: Less JavaScript to parse and execute
5. **Clear Boundaries**: Easy to understand what runs where

## Migration Strategy

1. **Phase 1**: Create new layout structure with server components
2. **Phase 2**: Extract client-only functionality into small islands
3. **Phase 3**: Implement granular data providers
4. **Phase 4**: Optimize bundle size by ensuring minimal client boundaries

## Alternative Approaches Considered

### Approach 1: Suspense Boundaries
Use React Suspense to show loading states for client components while keeping server content visible.

### Approach 2: Server Actions
Use Server Actions for mutations (delete todos, toggle complete) to reduce client-side state management.

### Approach 3: Partial Prerendering
Leverage Next.js 15's partial prerendering to statically generate the shell while streaming dynamic content.

## Conclusion

This architecture achieves the goal of maximizing server-side rendering while maintaining full interactivity. The key is creating small, focused client component islands within a server-rendered shell, and carefully managing where data providers are placed in the component tree.