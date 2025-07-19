'use client';
/**
 * ClientProviders Component
 * 
 * This is a CLIENT COMPONENT that wraps all global client-side providers.
 * It must be a client component because it uses React Context providers
 * which require JavaScript to run in the browser.
 * 
 * Currently only provides the ThemeProvider globally.
 * TodoDataProvider will be scoped to specific components that need it.
 */

import { ThemeProvider } from '../../contexts/ThemeContext';

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}