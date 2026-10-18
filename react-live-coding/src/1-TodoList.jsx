import { useState } from "react";

// Todo List: add, complete (toggle) and delete tasks.
// Concepts: useState, controlled input, map, filter, key.
export default function TodoList() {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState([]); // { id, text, done }

  function addTodo() {
    if (text.trim() === "") return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setText("");
  }

  function toggleTodo(id) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div>
      <h2>Todo List</h2>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New task"
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggleTodo(t.id)}
            />
            <span style={{ textDecoration: t.done ? "line-through" : "none" }}>
              {t.text}
            </span>
            <button onClick={() => deleteTodo(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <p>{todos.filter((t) => !t.done).length} task(s) left</p>
    </div>
  );
}
