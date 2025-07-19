
/**
 * TodoTextRenderer Component
 * 
 * This is a TRUE SERVER COMPONENT that handles todo text rendering and processing.
 * It runs on the server because:
 * 1. It's imported and rendered in page.jsx (a server component)
 * 2. The rendered React elements are passed down as props to client components
 * 3. It's NOT imported by any client component
 * 
 * Benefits:
 * - Text processing (truncation, escaping) happens on the server
 * - No JavaScript for text processing is sent to the client
 * - The HTML is pre-rendered and sent as serialized React elements
 * - Security: HTML escaping happens on the server
 * - Performance: Complex text transformations don't block the UI
 * 
 * This demonstrates the correct pattern for using server components
 * at the item level - render at the page level and pass down as props.
 */

import TodoTextDisplay from '../shared/TodoTextDisplay';

export default function TodoTextRenderer({ todoText, important, maxLength = 60 }) {
  // Sanitize and truncate text on the server
  const sanitizedText = todoText
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  const truncatedText = sanitizedText.length > maxLength 
    ? sanitizedText.slice(0, maxLength) + '...'
    : sanitizedText;
  
  // In an app with more capabilities, we could:
  // - Parse markdown to HTML
  // - Auto-link URLs
  // - Add syntax highlighting for code blocks
  // - Add emoji support
  
  // Use the shared component for consistent rendering
  return <TodoTextDisplay text={truncatedText} important={important} />;
}