import { useState } from "react";

const users = [
  "Asha Rao", "Ravi Kumar", "Meena Shetty", "Arjun Nair",
  "Divya Hegde", "Kiran Patil", "Anita Joshi", "Rahul Verma",
];

// Search + Filter: filter a list while the user types.
// Concepts: controlled input, derived data (no extra state), filter.
export default function SearchFilter() {
  const [query, setQuery] = useState("");

  // Computed on every render from "query" - no need for useEffect.
  const filtered = users.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <h2>Search Users</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a name..."
      />
      <ul>
        {filtered.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      {filtered.length === 0 && <p>No users found</p>}
    </div>
  );
}
