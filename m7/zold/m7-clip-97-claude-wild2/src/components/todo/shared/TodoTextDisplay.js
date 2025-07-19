/**
 * TodoTextDisplay Component
 * 
 * This is a SHARED COMPONENT that can be used by both server and client components.
 * It contains the common UI logic for displaying todo text with importance badge.
 * 
 * This component:
 * - Has no state or side effects
 * - Doesn't use any hooks
 * - Is pure presentational
 * - Can be safely imported by both server and client components
 * 
 * When imported by a server component, it runs on the server.
 * When imported by a client component, it runs on the client.
 */

export default function TodoTextDisplay({ text, important }) {
  console.log("TodoTextDisplay: Rendering TodoTextDisplay with text:", text);
  return (
    <span className="todo-text">
      {important && (
        <span className="badge warning-bg">
          <i className="fa fa-exclamation-circle"></i>
        </span>
      )}
      {text}
    </span>
  );
}