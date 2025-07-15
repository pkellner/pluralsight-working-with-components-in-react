import ToDo from "./ToDo";
import DragDropContextProvider, {
  DragDropToDoList,
} from "../../contexts/DragDropContextProvider";
import { useContext, useState, useEffect } from "react";
import { ToDosDataContext } from "../../contexts/ToDosDataContext";


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
          renderTodo={(todo) => (
            <ToDo
              key={todo.id}
              todoItem={todo}
              handleToggleCompleted={handleToggle}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              idUpdating={idUpdating}
            />
          )}
        />
      </DragDropContextProvider>
    </div>
  );
};

export default ToDoList;
