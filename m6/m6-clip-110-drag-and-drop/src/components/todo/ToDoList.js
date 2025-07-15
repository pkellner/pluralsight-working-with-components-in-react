import ToDo from "./ToDo";
import DragDropContextProvider, {
  useDragDrop,
} from "../../contexts/DragDropContextProvider";
import {
  useContext,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
} from "react";
import { ToDosDataContext } from "../../contexts/ToDosDataContext";

// Drag and drop list item component
const DraggableToDo = ({
  todo,
  index,
  handleToggle,
  handleDelete,
  handleEdit,
  idUpdating,
}) => {
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
  const [droppedItemAnimation, setDroppedItemAnimation] = useState(null);

  const animationMs = 600;
  const itemGap = 6;

  useLayoutEffect(() => {
    if (!pendingReorder || !itemRef.current) {
      return;
    }

    const isDroppedItem = pendingReorder.droppedId === todo.id;
    const isDropTarget = pendingReorder.dropTargetId === todo.id;

    // Handle animation for the dropped item
    if (isDroppedItem && pendingReorder.dropPosition) {
      const element = itemRef.current;
      const finalRect = element.getBoundingClientRect();

      const dragOffset = pendingReorder.dragOffset || { x: 0, y: 0 };
      const startX = pendingReorder.dropPosition.x - dragOffset.x;
      const startY = pendingReorder.dropPosition.y - dragOffset.y;

      const deltaX = startX - finalRect.left;
      const deltaY = startY - finalRect.top;

      const uniqueAnimationName = `animate-dropped-${todo.id}-${Date.now()}`;

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
      (i) => i.id === todo.id,
    );
    const currentIndex = index;
    const indexDiff = previousIndex - currentIndex;

    if (indexDiff !== 0) {
      const itemHeight = itemRef.current.offsetHeight;
      const totalHeight = itemHeight + itemGap;
      const translateDistance = indexDiff * totalHeight;

      const uniqueAnimationName = `animate-${todo.id}-${Date.now()}`;

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
  }, [pendingReorder, todo.id, index]);

  const isDragging = draggedItem?.id === todo.id;
  const isDraggedOver = draggedOverItem?.id === todo.id;
  const isPending = pendingReorder !== null;
  const isDroppedItem = pendingReorder?.droppedId === todo.id;

  let zIndex = 1;
  if (isPending) {
    if (pendingReorder?.dropTargetId === todo.id) {
      zIndex = 0;
    } else if (isDroppedItem) {
      zIndex = 10;
    }
  }

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={(e) => handleDragStart(e, todo)}
      onDragOver={handleDragOver}
      onDragEnter={(e) => handleDragEnter(e, todo)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, todo)}
      onDragEnd={handleDragEnd}
      style={{
        cursor: "move",
        position: "relative",
        zIndex,
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
        opacity: isDragging ? 0.5 : 1,
      }}
      className={isDraggedOver ? "dragged-over" : ""}
    >
      <ToDo
        key={todo.id}
        todoItem={todo}
        handleToggleCompleted={handleToggle}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        idUpdating={idUpdating}
      />
    </div>
  );
};

// List content component that uses drag drop context
const DragDropToDoList = ({
  todos,
  handleToggle,
  handleDelete,
  handleEdit,
  idUpdating,
}) => {
  const { pendingReorder } = useDragDrop();
  const displayTodos = pendingReorder ? pendingReorder.items : todos;

  return (
    <>
      {displayTodos.map((todo, index) => (
        <DraggableToDo
          key={todo.id}
          todo={todo}
          index={index}
          handleToggle={handleToggle}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          idUpdating={idUpdating}
        />
      ))}
    </>
  );
};

const ToDoList = ({
  displayStatus,
  toDoList,
  important,
  searchText,
  handleToggle,
  handleDelete,
  handleEdit,
  idUpdating,
}) => {
  const { updateTodo } = useContext(ToDosDataContext);
  const [orderedList, setOrderedList] = useState(toDoList);

  // Update orderedList when toDoList changes
  useEffect(() => {
    setOrderedList(toDoList);
  }, [toDoList]);

  const filteredList = orderedList
    .filter((todo) => {
      if (displayStatus === "all") {
        return true;
      } else if (displayStatus === "pending") {
        return todo.completed === false;
      } else if (displayStatus === "completed") {
        return todo.completed === true;
      } else {
        return false;
      }
    })
    .filter((todo) => {
      if (important === true) {
        return todo.important === true;
      } else {
        return true;
      }
    })
    .filter((todo) => {
      if (searchText?.length > 0) {
        return todo.todoText
          .toLocaleLowerCase()
          .includes(searchText.toLocaleLowerCase());
      } else {
        return true;
      }
    });

  const handleItemsChange = (newItems) => {
    // Update the order in the full list
    const newOrderedList = [...toDoList];

    // Create a map of the new order from filtered items
    const orderMap = new Map();
    newItems.forEach((item, index) => {
      orderMap.set(item.id, index);
    });

    // Sort the full list based on the new order of filtered items
    newOrderedList.sort((a, b) => {
      const aIndex = orderMap.get(a.id);
      const bIndex = orderMap.get(b.id);

      // If both items are in the reordered list, use their new order
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }

      // If only one item is in the reordered list, keep relative positions
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;

      // If neither item is in the reordered list, maintain original order
      return toDoList.indexOf(a) - toDoList.indexOf(b);
    });

    setOrderedList(newOrderedList);
  };

  return (
    <div className="tasks">
      <DragDropContextProvider
        items={filteredList}
        onItemsChange={handleItemsChange}
      >
        <DragDropToDoList
          todos={filteredList}
          handleToggle={handleToggle}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          idUpdating={idUpdating}
        />
      </DragDropContextProvider>
    </div>
  );
};

export default ToDoList;
