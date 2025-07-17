import ToDo from "./ToDo";
import DragDropContextProvider, {
  DragDropToDoList,
} from "../../contexts/DragDropContextProvider";
import { useContext } from "react";
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

  // Derive filtered list directly from props - no local state needed
  const filteredList = toDoList
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

  // Handle reordering by updating todos with new sequence values
  const handleItemsChange = (reorderedFullList) => {
    // Update each todo with its new sequence based on position
    reorderedFullList.forEach((todo, index) => {
      if (todo.sequence !== index) {
        updateTodo({ ...todo, sequence: index });
      }
    });
  };

  return (
    <div className="tasks">
      <DragDropContextProvider
        items={filteredList}
        fullList={toDoList}
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
