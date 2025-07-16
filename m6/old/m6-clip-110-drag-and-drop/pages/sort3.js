import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// Context
const DragDropContext = createContext(undefined);

// Provider
function DragDropProvider({ children }) {
  const [items, setItems] = useState([
    { id: 1, text: "Item 1" },
    { id: 2, text: "Item 2" },
    { id: 3, text: "Item 3" },
    { id: 4, text: "Item 4" },
    { id: 5, text: "Item 5" },
  ]);

  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState(null);
  const [pendingReorder, setPendingReorder] = useState(null);

  function handleDragStart(e, item) {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(e, item) {
    e.preventDefault();
    setDraggedOverItem(item);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    const target = e.target;
    if (target.classList.contains("list-item")) {
      setDraggedOverItem(null);
    }
  }

  function handleDrop(e, dropItem) {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === dropItem.id) {
      return;
    }

    const draggedIndex = items.findIndex((item) => item.id === draggedItem.id);
    const dropIndex = items.findIndex((item) => item.id === dropItem.id);

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    // Set pending reorder with original items and drop target ID for reference
    setPendingReorder({
      items: newItems,
      droppedId: draggedItem.id,
      dropTargetId: dropItem.id,
      originalItems: items,
    });

    // Execute reorder after 3 seconds
    setTimeout(() => {
      setItems(newItems);
      setPendingReorder(null);
    }, 3000);

    setDraggedItem(null);
    setDraggedOverItem(null);
  }

  function handleDragEnd(e) {
    e.preventDefault();
    setDraggedItem(null);
    setDraggedOverItem(null);
  }

  return (
    <DragDropContext.Provider
      value={{
        items,
        draggedItem,
        draggedOverItem,
        pendingReorder,
        handleDragStart,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

// Hook
function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error("useDragDrop must be used within a DragDropProvider");
  }
  return context;
}

// ListItem Component
function ListItem({ item, index }) {
  const {
    draggedItem,
    draggedOverItem,
    pendingReorder,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragDrop();

  const itemRef = useRef(null);
  const [animationName, setAnimationName] = useState(null);

  useLayoutEffect(() => {
    if (!pendingReorder || !itemRef.current) {
      return;
    }

    const isDroppedItem = pendingReorder.droppedId === item.id;
    const isDropTarget = pendingReorder.dropTargetId === item.id;

    // Skip animation for the dropped item - it's already in position
    if (isDroppedItem) {
      return;
    }

    // Calculate position animation for all items that need to move
    const previousIndex = pendingReorder.originalItems.findIndex(
      (i) => i.id === item.id,
    );
    const currentIndex = index;
    const indexDiff = previousIndex - currentIndex;

    if (indexDiff !== 0) {
      const itemHeight = itemRef.current.offsetHeight;
      const gap = 8; // margin between items
      const totalHeight = itemHeight + gap;
      const translateDistance = indexDiff * totalHeight;

      const uniqueAnimationName = `animate-${item.id}-${Date.now()}`;

      const keyframes = `
        @keyframes ${uniqueAnimationName} {
          0% {
            transform: translateY(${translateDistance}px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `;

      const styleElement = document.createElement("style");
      styleElement.textContent = keyframes;
      document.head.appendChild(styleElement);

      setAnimationName(uniqueAnimationName);

      setTimeout(() => {
        setAnimationName(null);
        document.head.removeChild(styleElement);
      }, 3000);
    }
  }, [pendingReorder, item.id, index]);

  const isDragging = draggedItem?.id === item.id;
  const isDraggedOver = draggedOverItem?.id === item.id;
  const isPending = pendingReorder !== null;
  const isDropTarget = pendingReorder?.dropTargetId === item.id;
  const isDroppedItem = pendingReorder?.droppedId === item.id;

  // Determine z-index during animation
  let zIndex = 1; // default z-index
  if (isPending) {
    if (isDropTarget) {
      zIndex = 0; // drop target goes behind
    } else if (isDroppedItem) {
      zIndex = 10; // dropped item goes on top
    }
  }

  // Build class names
  const classNames = [
    "list-item",
    "p-3",
    "bg-white",
    "border",
    "border-2",
    "rounded",
    "list-group-item",
    isDragging ? "opacity-50" : "",
    isDraggedOver ? "border-primary bg-primary bg-opacity-10" : "",
    isPending && !isDroppedItem && !isDropTarget ? "opacity-75" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      ref={itemRef}
      draggable
      onDragStart={(e) => handleDragStart(e, item)}
      onDragOver={handleDragOver}
      onDragEnter={(e) => handleDragEnter(e, item)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, item)}
      onDragEnd={handleDragEnd}
      style={{
        cursor: "move",
        position: "relative",
        zIndex: zIndex,
        transition: "box-shadow 0.2s",
        ...(animationName
          ? {
              animation: `${animationName} 3s ease-in-out forwards`,
            }
          : {}),
      }}
      onMouseEnter={(e) => {
        if (!isDragging && !isPending) {
          e.currentTarget.classList.add("shadow-sm");
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.classList.remove("shadow-sm");
      }}
      className={classNames}
    >
      {item.text}
    </li>
  );
}

// Main List Component
function DragDropListContent() {
  const { items, pendingReorder } = useDragDrop();
  const isPending = pendingReorder !== null;

  // Use pending items for display order if available, otherwise use actual items
  const displayItems = pendingReorder ? pendingReorder.items : items;

  return (
    <div className="p-4" style={{ maxWidth: "28rem", margin: "0 auto" }}>
      <h2 className="h3 fw-bold mb-4">Drag and Drop List</h2>
      <ul className={`list-unstyled ${isPending ? "pe-none" : ""}`}>
        {displayItems.map((item, index) => (
          <ListItem key={item.id} item={item} index={index} />
        ))}
      </ul>
      <div className="mt-4 text-muted small">
        Drag any item to reorder the list
        {isPending && (
          <span className="ms-2 fw-semibold">(Updating in 3 seconds...)</span>
        )}
      </div>
    </div>
  );
}

// Main Component with Provider
export default function DragDropList() {
  return (
    <DragDropProvider>
      <DragDropListContent />
    </DragDropProvider>
  );
}
