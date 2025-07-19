'use client';
/**
 * ThemedAppShell Component
 * 
 * This is a CLIENT COMPONENT that renders the main app shell with theme support.
 * It must be a client component because:
 * 1. It uses the useContext hook to access theme state
 * 2. The theme can change dynamically based on user interaction
 * 
 * This component wraps the entire app content and applies the theme
 * data attribute that controls the CSS theme variables.
 */

import { useContext } from 'react';
import { ThemeContext } from '../../../contexts/ThemeContext';

export default function ThemedAppShell({ children }) {
  // Access theme context to get current theme state
  const { darkTheme } = useContext(ThemeContext);
  
  return (
    <div className="container" data-theme={darkTheme ? "dark" : "light"}>
      {children}
    </div>
  );
}