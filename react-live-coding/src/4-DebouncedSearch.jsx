import { useState, useEffect } from "react";

// Debounced Search: wait until the user stops typing before calling the API.
// Concepts: useEffect + setTimeout + cleanup function.
export default function DebouncedSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    // Start a timer. If the user types again within 500ms,
    // the cleanup below cancels it, so only the last keystroke fetches.
    const timer = setTimeout(async () => {
      const res = await fetch(
        "https://dummyjson.com/products/search?q=" + encodeURIComponent(query)
      );
      const data = await res.json();
      setResults(data.products);
    }, 500);

    return () => clearTimeout(timer); // cleanup
  }, [query]);

  return (
    <div>
      <h2>Debounced Search</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products (try: phone)"
      />
      <ul>
        {results.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </div>
  );
}
