export type Guide = {
  slug: string;
  title: string;
  category: "Frontend" | "Backend" | "Data" | "Cloud" | "Foundations";
  level: "Beginner" | "Intermediate";
  icon: string;
  summary: string;
  outcome: string;
  topics: { title: string; detail: string }[];
  questions: { question: string; answer: string }[];
};

// Add future skill guides here. The catalog and search read from this list.
export const guides: Guide[] = [
  {
    slug: "javascript",
    title: "JavaScript essentials",
    category: "Frontend",
    level: "Beginner",
    icon: "JS",
    summary: "Learn the language features behind modern web apps.",
    outcome: "Explain scope, asynchronous code, and data handling with practical examples.",
    topics: [
      { title: "Values and scope", detail: "Compare const and let, primitives and objects, and how closures keep access to their outer scope." },
      { title: "Arrays and objects", detail: "Practice map, filter, reduce, destructuring, spread syntax, and immutable updates." },
      { title: "Async JavaScript", detail: "Trace the call stack, promise callbacks, async/await, and error handling." },
    ],
    questions: [
      { question: "What is a closure?", answer: "A function that retains access to variables from the scope where it was created, even after that scope has returned." },
      { question: "What does Promise.all do?", answer: "It waits for all input promises to fulfill, then returns their results in input order. It rejects when any input rejects." },
    ],
  },
  {
    slug: "react",
    title: "React fundamentals",
    category: "Frontend",
    level: "Beginner",
    icon: "⚛",
    summary: "Build interfaces from components, state, and effects.",
    outcome: "Design a small React feature and explain its rendering behavior.",
    topics: [
      { title: "Component thinking", detail: "Split a screen into reusable components and pass data through props." },
      { title: "State and rendering", detail: "Keep state minimal, derive values when possible, and use stable keys for lists." },
      { title: "Effects", detail: "Use effects to synchronize with external systems and clean up subscriptions or requests." },
    ],
    questions: [
      { question: "When should you use an effect?", answer: "When a component needs to synchronize with something outside React, such as an event listener or browser API." },
      { question: "Why do list items need keys?", answer: "Keys help React match items across renders so state stays attached to the correct item." },
    ],
  },
  {
    slug: "nodejs-apis",
    title: "Node.js and APIs",
    category: "Backend",
    level: "Intermediate",
    icon: "API",
    summary: "Understand request handling, API design, and reliability.",
    outcome: "Sketch an API with clear routes, validation, errors, and tests.",
    topics: [
      { title: "HTTP basics", detail: "Choose methods and status codes that reflect the outcome of each request." },
      { title: "Validation and errors", detail: "Validate input at boundaries and return consistent, safe error messages." },
      { title: "Reliability", detail: "Practice timeouts, pagination, logging, and idempotency for operations that may be retried." },
    ],
    questions: [
      { question: "What makes an API operation idempotent?", answer: "Repeating the same request has the same intended effect as sending it once." },
      { question: "Where should input be validated?", answer: "At the API boundary before the data is used, and again where domain rules require it." },
    ],
  },
  {
    slug: "sql",
    title: "SQL and databases",
    category: "Data",
    level: "Beginner",
    icon: "DB",
    summary: "Query relational data and reason about schema design.",
    outcome: "Write joins and aggregates, then explain basic indexing tradeoffs.",
    topics: [
      { title: "Query building", detail: "Practice SELECT, WHERE, GROUP BY, HAVING, ordering, and pagination." },
      { title: "Relationships", detail: "Model primary and foreign keys and choose the right join for a question." },
      { title: "Performance", detail: "Inspect query plans and add indexes for frequent filters and joins, weighing write cost." },
    ],
    questions: [
      { question: "How does an INNER JOIN differ from a LEFT JOIN?", answer: "An inner join returns matching rows; a left join also retains unmatched rows from the left table." },
      { question: "Why can an index slow writes?", answer: "Inserts and updates must also maintain each relevant index." },
    ],
  },
  {
    slug: "system-design",
    title: "System design basics",
    category: "Foundations",
    level: "Intermediate",
    icon: "SD",
    summary: "Practice turning vague requirements into a workable design.",
    outcome: "Lead a design discussion from requirements through tradeoffs and bottlenecks.",
    topics: [
      { title: "Clarify the goal", detail: "Ask about users, scale, latency, consistency, and failure expectations before drawing components." },
      { title: "Core architecture", detail: "Describe clients, APIs, storage, caches, queues, and how data moves between them." },
      { title: "Tradeoffs", detail: "Identify bottlenecks and explain what you would measure before adding complexity." },
    ],
    questions: [
      { question: "When would you add a cache?", answer: "When repeated reads are costly or slow and the application can define an acceptable freshness policy." },
      { question: "What is a useful first step in a design interview?", answer: "Clarify the functional requirements and the scale or reliability constraints." },
    ],
  },
  {
    slug: "cloud-fundamentals",
    title: "Cloud fundamentals",
    category: "Cloud",
    level: "Beginner",
    icon: "☁",
    summary: "Learn the building blocks of hosting a reliable application.",
    outcome: "Choose basic compute, storage, and networking components for an app.",
    topics: [
      { title: "Compute and storage", detail: "Compare servers, containers, and functions; distinguish object storage from databases." },
      { title: "Networking", detail: "Understand DNS, HTTPS, load balancing, and private versus public services." },
      { title: "Operations", detail: "Plan identity, secrets, monitoring, backups, and cost visibility from the start." },
    ],
    questions: [
      { question: "What is the purpose of a load balancer?", answer: "It distributes requests across healthy targets and provides a stable entry point." },
      { question: "Where should application secrets live?", answer: "In a managed secret store or secure runtime configuration, never in source code." },
    ],
  },
];
