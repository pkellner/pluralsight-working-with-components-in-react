'use client';
/**
 * HeaderActions Component
 * 
 * This is a CLIENT COMPONENT that contains interactive elements for the header.
 * It must be a client component because:
 * 1. It handles user interaction (theme toggle)
 * 2. It uses React hooks (useContext)
 * 3. It needs access to client-side state (theme context)
 * 
 * This component is embedded as a "client island" within the server-rendered header.
 */

import { useContext } from 'react';
import { ThemeContext } from '../../../contexts/ThemeContext';

export default function HeaderActions({ layoutVersion }) {
  // Access theme context for current theme state and toggle function
  const { darkTheme, toggleTheme } = useContext(ThemeContext);

  return (
    <span className="nav-item">
      <input
        type="checkbox"
        checked={darkTheme === true}
        className="theme-toggle-checkbox"
        autoComplete="off"
        id="toggleThemeId"
        onChange={() => {
          toggleTheme();
        }}
      />
      <label htmlFor="toggleThemeId" className="theme-toggle-checkbox-label">
        <i className="fas fa-moon"></i>
        <i className="fas fa-sun"></i>
        <span className="ball"></span>
      </label>
      <span>{layoutVersion}</span>
    </span>
  );
}