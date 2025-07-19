# Architecture: Client Components

## Overview

This document outlines the client-side component architecture for the Todo application built with React 19 and Next.js 15. The application uses React Context API for state management and implements advanced features like drag-and-drop functionality.

### 1. Technology Stack

- **React 19.1.0** - UI library with hooks
- **Next.js 15.4.1** - Framework for routing and SSR
- **Context API** - State management (no Redux/Zustand)
- **Bootstrap CSS** - Styling framework
- **Axios** - HTTP client for API calls

### 2. Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── ErrorBoundary.js (Error handling wrapper)
│   │   └── Spinner.js (Loading indicator)
│   │
│   ├── hocs/
│   │   └── withTheme.js (Higher-order component for theme)
│   │
│   ├── layout/
│   │   ├── Footer.js (Footer with theme support)
│   │   ├── Header.js (Header with theme support)
│   │   └── Layout.js (Main layout wrapper)
│   │
│   └── todo/
│       ├── DraggableToDo.js (Drag-enabled todo wrapper)
│       ├── ToDo.js (Individual todo item)
│       ├── ToDoAdd.js (Add todo form)
│       ├── ToDoDemo4.js (Demo with AddEditDelete)
│       ├── ToDoDemo5.js (Demo with useTransition)
│       ├── ToDoFilterNavLinks.js (Filter navigation)
│       ├── ToDoList.js (Todo list container)
│       ├── ToDoListDemo4.js (Demo list component)
│       ├── ToDoManager.js (Main todo manager)
│       └── ToDoSortAndSearch.js (Sort and search controls)
│
├── contexts/
│   ├── DragDropContextProvider.js (Drag-drop state management)
│   ├── ThemeContext.js (Theme state management)
│   └── ToDosDataContext.js (Todo data state management)
│
├── hooks/
│   ├── useGeneralizedCrudMethods.js (CRUD operations helper)
│   ├── useTheme.js (Theme context hook)
│   └── useTodosData.js (Todo data management hook)
│
└── pages/
    ├── _app.js (Next.js app wrapper)
    ├── _document.js (Next.js document structure)
    ├── index.js (Home page)
    ├── demo4.js (Demo page 4)
    └── demo5.js (Demo page 5)
```

### 3. State Management Architecture

#### Context Providers Hierarchy
```
<ThemeContext.Provider>
  <ToDosDataContext.Provider>
    <DragDropContextProvider>
      <App Components />
    </DragDropContextProvider>
  </ToDosDataContext.Provider>
</ThemeContext.Provider>
```

#### Key Contexts

1. **ThemeContext**
   - Manages light/dark theme state
   - Provides theme toggle functionality
   - Used by Layout components

2. **ToDosDataContext**
   - Manages todo CRUD operations
   - Handles API communication
   - Provides loading and error states
   - Methods: createToDo, updateToDo, deleteToDo

3. **DragDropContextProvider**
   - Manages drag-and-drop state
   - Handles animation sequences (600ms)
   - Tracks dragging item and drop target
   - Manages todo reordering

### 4. Component Patterns

#### Manager-Presentation Pattern
- **ToDoManager.js** - Business logic and state coordination
- **ToDoList.js** - Presentation and filtering logic
- **ToDo.js** - Pure presentation component

#### HOC Pattern
- **withTheme** - Injects theme props into components
- Used for theme-aware components

#### Wrapper Components
- **DraggableToDo.js** - Adds drag capability to todo items
- **ErrorBoundary.js** - Catches and displays errors gracefully

### 5. Data Flow

```
API (pages/api/todo) 
    ↓
ToDosDataContext (via axios)
    ↓
useTodosData hook
    ↓
ToDoManager (orchestrates)
    ↓
ToDoList (filters/sorts)
    ↓
DraggableToDo (drag wrapper)
    ↓
ToDo (presentation)
```

### 6. Key Features Implementation

#### Drag and Drop
- Custom implementation (not using react-dnd)
- CSS keyframe animations dynamically injected
- State managed by DragDropContextProvider
- Maintains filtered list order integrity

#### Filtering and Search
- Implemented in ToDoList component
- Filters: All, Active, Completed
- Search by todo text
- Sort by completed status

#### Theme System
- Bootstrap-based theming
- Light/Dark mode toggle
- Theme persisted across sessions
- Applied via Layout component

### 7. Performance Optimizations

- **React.memo** - Used on ToDo components
- **useMemo** - For expensive filter operations
- **useCallback** - For stable function references
- **useTransition** - Demonstrated in demo5.js

### 8. Component Communication

#### Props Flow
- Minimal prop drilling due to Context usage
- Props mainly for component-specific data

#### Context Usage
- Global state via contexts
- Custom hooks for clean API
- Direct context consumption where needed

### 9. Error Handling

- **ErrorBoundary** components wrap major sections
- API errors handled in ToDosDataContext
- User-friendly error messages displayed

### 10. Styling Approach

- **Bootstrap CSS** for base styles
- **Global CSS** files for custom styles
- **Inline styles** for dynamic styling (drag-drop)
- **No CSS Modules** - traditional CSS approach