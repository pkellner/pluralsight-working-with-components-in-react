import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";

// ---------------------------------------------
// Constants
// ---------------------------------------------
export const animationMs = 600; // unified animation duration (ms)
export const itemGap = 6; // space between items (px)

// ---------------------------------------------
// Context
// ---------------------------------------------
const DragDropContext = createContext(undefined);

// ---------------------------------------------
// Provider
// ---------------------------------------------
export default function DragDropContextProvider({ children, items, onItemsChange }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState(null);
  const [pendingReorder, setPendingReorder] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);

  function handleDragStart(e, item) {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";

    // Store the offset of where the user clicked within the element
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setDragOffset({ x: offsetX, y: offsetY });
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

    // Get the exact drop position
    const dropX = e.clientX;
    const dropY = e.clientY;
    setDropPosition({ x: dropX, y: dropY });

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
      dropPosition: { x: dropX, y: dropY },
      dragOffset: dragOffset,
    });

    // Execute reorder after the unified animation duration
    setTimeout(() => {
      onItemsChange(newItems);
      setPendingReorder(null);
      setDropPosition(null);
      setDragOffset(null);
    }, animationMs);

    setDraggedItem(null);
    setDraggedOverItem(null);
  }

  function handleDragEnd(e) {
    e.preventDefault();

    // If no successful drop occurred, we might want to animate back
    if (draggedItem && !pendingReorder) {
      // Get current mouse position as the end position
      const endX = e.clientX;
      const endY = e.clientY;
      setDropPosition({ x: endX, y: endY });

      // Clear states after a short delay
      setTimeout(() => {
        setDraggedItem(null);
        setDraggedOverItem(null);
        setDropPosition(null);
        setDragOffset(null);
      }, 100);
    } else {
      setDraggedItem(null);
      setDraggedOverItem(null);
      setDragOffset(null);
    }
  }

  return (
    <DragDropContext.Provider
      value={{
        items,
        draggedItem,
        draggedOverItem,
        pendingReorder,
        dropPosition,
        dragOffset,
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

// ---------------------------------------------
// Hook
// ---------------------------------------------
export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error("useDragDrop must be used within a DragDropProvider");
  }
  return context;
}

// ---------------------------------------------
// ListItem Component
// ---------------------------------------------
function ListItem({ item, index }) {
  const {
    draggedItem,
    draggedOverItem,
    pendingReorder,
    dropPosition,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragDrop();

  const itemRef = useRef(null);
  const [animationName, setAnimationName] = useState(null);
  const [droppedItemAnimation, setDroppedItemAnimation] = useState(null);

  useLayoutEffect(() => {
    if (!pendingReorder || !itemRef.current) {
      return;
    }

    const isDroppedItem = pendingReorder.droppedId === item.id;
    const isDropTarget = pendingReorder.dropTargetId === item.id;

    // Handle animation for the dropped item
    if (isDroppedItem && pendingReorder.dropPosition) {
      const element = itemRef.current;
      const finalRect = element.getBoundingClientRect();

      // Calculate where the element should animate from
      // The drop position is where the mouse was, but we need to account for the drag offset
      const dragOffset = pendingReorder.dragOffset || { x: 0, y: 0 };
      const startX = pendingReorder.dropPosition.x - dragOffset.x;
      const startY = pendingReorder.dropPosition.y - dragOffset.y;

      // Calculate the translation needed to get from final position to start position
      const deltaX = startX - finalRect.left;
      const deltaY = startY - finalRect.top;

      const uniqueAnimationName = `animate-dropped-${item.id}-${Date.now()}`;

      const keyframes = `
        @keyframes ${uniqueAnimationName} {
          0% {
            transform: translate(${deltaX}px, ${deltaY}px);
            opacity: 0.5;
          }
          100% {
            transform: translate(0, 0);
            opacity: 1;
          }
        }
      `;

      const styleElement = document.createElement("style");
      styleElement.textContent = keyframes;
      document.head.appendChild(styleElement);

      setDroppedItemAnimation(uniqueAnimationName);

      setTimeout(() => {
        setDroppedItemAnimation(null);
        document.head.removeChild(styleElement);
      }, animationMs);

      return;
    }

    // Calculate position animation for all other items that need to move
    const previousIndex = pendingReorder.originalItems.findIndex(
      (i) => i.id === item.id,
    );
    const currentIndex = index;
    const indexDiff = previousIndex - currentIndex;

    if (indexDiff !== 0) {
      const itemHeight = itemRef.current.offsetHeight;
      const totalHeight = itemHeight + itemGap;
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
      }, animationMs);
    }
  }, [pendingReorder, item.id, index, dropPosition]);

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
    "rounded-3", // more rounded corners
    "list-group-item",
    "mb-3", // extra space between items
    isDragging ? "opacity-50" : "",
    isDraggedOver ? "border-primary border-3 bg-primary bg-opacity-10" : "", // highlighted border for drop zone
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
        zIndex,
        transition: "box-shadow 0.2s",
        marginBottom: `${itemGap}px`,
        ...(animationName
          ? {
            animation: `${animationName} ${animationMs}ms ease-out forwards`,
          }
          : {}),
        ...(droppedItemAnimation
          ? {
            animation: `${droppedItemAnimation} ${animationMs}ms ease-out forwards`,
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

// ---------------------------------------------
// Main List Component
// ---------------------------------------------
export function DragDropListContent({ items }) {
  const { pendingReorder } = useDragDrop();
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
          <span className="ms-2 fw-semibold">(Updating in {animationMs / 1000} seconds...)</span>
        )}
      </div>
    </div>
  );
}