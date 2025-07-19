'use client';
/**
 * FilterButtons Component
 * 
 * This is a CLIENT COMPONENT that handles todo filtering interactions.
 * It must be a client component because:
 * 1. It handles user interactions (button clicks)
 * 2. It manages state changes (filter and important status)
 * 3. It uses event handlers
 * 
 * This component renders the filter buttons for all/pending/completed
 * and the important toggle checkbox.
 */

export default function FilterButtons({ 
  displayStatus, 
  setDisplayStatus, 
  important, 
  setImportant,
  startTransition 
}) {
  return (
    <>
      <li className="nav-item">
        <a
          className={
            displayStatus === "all" ? "nav-link active" : "nav-link"
          }
          onClick={() => setDisplayStatus("all")}
          href="#"
        >
          All
        </a>
      </li>
      <li className="nav-item">
        <a
          className={
            displayStatus === "pending" ? "nav-link active" : "nav-link"
          }
          onClick={() => setDisplayStatus("pending")}
          href="#"
        >
          Pending
        </a>
      </li>
      <li className="nav-item">
        <a
          className={
            displayStatus === "completed" ? "nav-link active" : "nav-link"
          }
          onClick={() => setDisplayStatus("completed")}
          href="#"
        >
          Completed
        </a>
      </li>
      <li className="nav-item">
        <div className="form-check d-flex align-items-center">
          <input
            className="form-check-input"
            type="checkbox"
            id="important-checkbox-toggle-id"
            checked={important}
            onChange={() => {
              setImportant((prev) => {
                return !prev;
              });
            }}
          />
          <label
            className="form-check-label"
            htmlFor="important-checkbox-toggle-id"
          >
            Important
          </label>
        </div>
      </li>
    </>
  );
}