

// ---------------------------------------------
// Main Component with Provider
// ---------------------------------------------
import { useState } from "react";
import DragDropContextProvider, { DragDropListContent } from "../src/contexts/DragDropContextProvider";

export default function DragDropList() {
  const [items, setItems] = useState([
    { id: 1, text: "Item 1" },
    { id: 2, text: "Item 2" },
    { id: 3, text: "Item 3" },
    { id: 4, text: "Item 4" },
    { id: 5, text: "Item 5" },
  ]);

  function handleItemsChange(newItems) {
    setItems(newItems);
  }

  return (
    <DragDropContextProvider items={items} onItemsChange={handleItemsChange}>
      <DragDropListContent items={items} />
    </DragDropContextProvider>
  );
}