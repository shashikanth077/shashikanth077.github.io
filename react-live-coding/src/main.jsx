import { useState } from "react";
import { createRoot } from "react-dom/client";
import TodoList from "./1-TodoList";
import SearchFilter from "./2-SearchFilter";
import ApiFetch from "./3-ApiFetch";
import DebouncedSearch from "./4-DebouncedSearch";
import Pagination from "./5-Pagination";
import ShoppingCart from "./6-ShoppingCart";

// Each exercise is a separate component. Pick one from the tabs.
const exercises = {
  "1. Todo List": TodoList,
  "2. Search Filter": SearchFilter,
  "3. API Fetch": ApiFetch,
  "4. Debounced Search": DebouncedSearch,
  "5. Pagination": Pagination,
  "6. Shopping Cart": ShoppingCart,
};

function App() {
  const [name, setName] = useState("1. Todo List");
  const Exercise = exercises[name];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "20px auto" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {Object.keys(exercises).map((n) => (
          <button key={n} onClick={() => setName(n)} disabled={n === name}>
            {n}
          </button>
        ))}
      </div>
      <Exercise />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
