import ToDo from "./ToDo";
import DragDropContextProvider, {
  DragDropToDoList,
} from "../../contexts/DragDropContextProvider";
import { useEffect, useState } from "react";

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
  const [orderedList, setOrderedList] = useState(toDoList);

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

  const handleItemsChange = (newOrderedList) => {
    setOrderedList(newOrderedList);
  };

  return (
    <div className="tasks">
      <DragDropContextProvider
        items={filteredList}
        fullList={orderedList}
        onItemsChange={handleItemsChange}
      >
        <DragDropToDoList>
          <ToDo
            handleToggleCompleted={handleToggle}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            idUpdating={idUpdating}
          />
        </DragDropToDoList>
      </DragDropContextProvider>
    </div>
  );
};

export default ToDoList;
