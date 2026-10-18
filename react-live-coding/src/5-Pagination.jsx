import { useState } from "react";

// 50 fake records
const records = Array.from({ length: 50 }, (_, i) => "Record " + (i + 1));
const PAGE_SIZE = 10;

// Pagination: show PAGE_SIZE records at a time.
// Concepts: slice, simple math, disabled buttons.
export default function Pagination() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(records.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = records.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <h2>Pagination</h2>
      <ul>
        {pageItems.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Prev
      </button>
      <span style={{ margin: "0 10px" }}>
        Page {page} of {totalPages}
      </span>
      <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
        Next
      </button>
    </div>
  );
}
