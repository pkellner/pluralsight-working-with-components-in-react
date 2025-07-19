'use client';
/**
 * SearchInput Component
 * 
 * This is a CLIENT COMPONENT that handles search input.
 * It must be a client component because:
 * 1. It handles user input events
 * 2. It manages search state updates
 * 3. It uses event handlers
 * 
 * This component renders the search input field and handles
 * text changes with transitions for better performance.
 */

export default function SearchInput({ searchText, setSearchText, startTransition }) {
  const handleSearchChange = (e) => {
    const value = e.target.value;
    startTransition(() => {
      setSearchText(value);
    });
  };

  return (
    <input
      value={searchText}
      onChange={handleSearchChange}
      type="text"
      className="form-search-text"
      placeholder="Search"
    />
  );
}