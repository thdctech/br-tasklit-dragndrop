document.addEventListener("DOMContentLoaded", function () {
  const taskInput = document.getElementById("taskInput");
  const addTaskButton = document.getElementById("addTask");
  const taskList = document.getElementById("taskList");
  let draggedItem = null;

  // Load tasks from local storage on page load
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  for (const taskText of savedTasks) {
    addTaskToList(taskText);
  }

  addTaskButton.addEventListener("click", function () {
    const taskText = taskInput.value.trim();

    if (taskText !== "") {
      addTaskToList(taskText);
      taskInput.value = "";
      saveTasksToLocalStorage();
    }
  });

  taskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addTaskButton.click();
    }
  });

  // Function to add a task to the list
  function addTaskToList(taskText) {
    const li = document.createElement("li");
    li.draggable = true; // Make the newly created task item draggable
    li.innerHTML = `
          <span>${taskText}</span>
          <button class="delete-button">Delete</button>
      `;

    taskList.appendChild(li);

    li.querySelector(".delete-button").addEventListener("click", function () {
      li.remove();
      saveTasksToLocalStorage();
    });

    // Add event listeners for drag and drop
    li.addEventListener("dragstart", function (e) {
      draggedItem = this;
      setTimeout(function () {
        draggedItem.classList.add("dragging");
      }, 0);
    });

    li.addEventListener("dragend", function () {
      draggedItem = null;
      this.classList.remove("dragging");
      saveTasksToLocalStorage();
    });

    taskList.addEventListener("dragover", function (e) {
      e.preventDefault(); // Allow dropping
      const afterElement = getDragAfterElement(taskList, e.clientY);
      const currentElement = document.querySelector(".dragging");
      if (afterElement == null) {
        taskList.appendChild(currentElement);
      } else {
        taskList.insertBefore(currentElement, afterElement);
      }
    });

    saveTasksToLocalStorage();
  }

  // Function to save tasks to local storage
  function saveTasksToLocalStorage() {
    const tasks = [...taskList.querySelectorAll("li")].map(
      (li) => li.querySelector("span").textContent
    );
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Function to get the element after which we should drop the dragged item
  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll("li:not(.dragging)"),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
});
