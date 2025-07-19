/**
 * Header Component
 * 
 * This is a SERVER COMPONENT that renders the header structure.
 * It must be a server component because:
 * 1. It only renders static HTML structure
 * 2. It has no interactivity or state
 * 3. It delegates all interactive functionality to HeaderActions
 * 
 * Benefits of making this a server component:
 * - The header structure HTML is rendered on the server
 * - Only the interactive HeaderActions component ships JavaScript
 * - Demonstrates proper server/client component separation
 * - Shows how to compose server components with client components
 */

import HeaderActions from '../client/HeaderActions';

export default function Header({ layoutVersion }) {
  return (
    <header>
      <h2>To-do List</h2>
      {/* All interactive elements are in HeaderActions */}
      <HeaderActions layoutVersion={layoutVersion} />
    </header>
  );
}