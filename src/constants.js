// Home Data
export const homeData = {
  firstName: "Shashikanth",
  lastName: "H R",
  designation: "Principal Engineer",
  address: "Bengaluru, India",
  img: "/img/hero/profile.png",
  bio: "Accomplished Principal Engineer with 12+ years of experience in full-stack development, systems architecture, and engineering leadership across Wipro, IBM, Sonata & more.",
  numberOfProject: 15,
  numberofyear: 12,
};

// About Data
export const aboutData = {
  designation: "Principal Engineer",
  title: "I Build Scalable, High-Performance Web Applications",
  text: [
    "Accomplished Principal Engineer with 12+ years of progressive experience in full-stack software development, systems architecture, and engineering team leadership across multinational organisations including Wipro, IBM, Sonata Software, and Theorem Inc.",
    "Expert in designing and delivering scalable web applications with demonstrated 25–40% operational efficiency improvements. Currently transitioning to AI Engineering, enrolling in the Master's in Engineering of Artificial Intelligence at VILNIUS TECH (VGTU), Lithuania (September 2026).",
  ],
  skillIcons: [
    { name: "frontend", icon: "/img/svg/design.svg" },
    { name: "backend", icon: "/img/svg/development.svg" },
    { name: "cloud", icon: "/img/svg/cpu.svg" },
    { name: "web", icon: "/img/svg/web.svg" },
  ],
};

// Portfolio Data
export const portfolioData = [
  {
    img: "/img/portfolio/1.png",
    category: "Clinical Data Management",
    client: "IQVIA",
    date: "2024 – 2026",
    title: "BIOS Clinical Trial Platform",
    tech: "React · Node.js · TypeScript · MySQL · REST APIs · Micro-frontend · Redux Toolkit · GitLab",
    description: [
      "Designing and developing IQVIA's BIOS — a comprehensive clinical trial data management platform used across multiple global study phases. The platform streamlines regulatory compliance workflows, automates complex data collection processes, and provides advanced reporting capabilities tailored for clinical researchers, data managers, and trial coordinators. IQVIA's BIOS unit consists of global teams of biostatisticians and programmers providing statistical consulting, complex study design (e.g., adaptive Phase I-III designs), data insights, and regulatory submission support for global clinical trials.",
      "Key contributions include architecting a multi-tenant data validation layer that eliminates manual entry errors, redesigning UI workflows to improve coordinator efficiency by 35%, and integrating with IQVIA's upstream clinical systems via secure REST APIs. The solution supports Preclinical through Phase IV trial stages and meets 21 CFR Part 11 compliance standards.",
    ],
    highlights: [
      "Reduced manual data entry errors by 40% through automated validation",
      "Supports Phase I–IV clinical trial lifecycle management",
      "Compliant with 21 CFR Part 11 and GDPR regulations",
      "Micro-frontend architecture with global biostatistics team integration",
    ],
  },
  {
    img: "/img/portfolio/2.png",
    category: "Financial Technology",
    client: "New Zealand Banking Consortium",
    date: "2021 – 2023",
    title: "Banking & Investment Portal",
    tech: "React · Redux Toolkit · Node.js · GraphQL · Azure · Semantic UI",
    description: [
      "Built an enterprise-grade banking and investment management portal for New Zealand's financial sector, enabling investment professionals to generate, manage, and distribute detailed investment reports across multiple output formats including PDF, Excel, and CSV.",
      "The platform features advanced full-text search and dynamic filtering across large financial datasets, real-time portfolio analytics dashboards, and role-based access control. Deployed on Azure with banking-grade authentication and compliance with New Zealand Financial Markets Authority (FMA) reporting requirements.",
    ],
    highlights: [
      "Multi-format report generation (PDF, Excel, CSV) at enterprise scale",
      "Advanced investment search with real-time filtering across NZ bank data",
      "Role-based access control with banking-grade security",
      "Deployed on Azure with 99.9% uptime SLA",
    ],
  },
  {
    img: "/img/portfolio/3.png",
    category: "E-Commerce & Retail",
    client: "Aditya Birla Fashion & Retail",
    date: "2019 – 2021",
    title: "Multi-Brand Retail Platform",
    tech: "React · Node.js · TypeScript · MySQL · Redux · Docker · Kubernetes",
    description: [
      "Developed a unified multi-brand online retail platform for Aditya Birla Fashion & Retail, one of India's largest fashion conglomerates. The platform aggregates flagship brands — Van Heusen, Allen Solly, Peter England, and Louis Philippe — under a single seamless shopping experience.",
    ],
    highlights: [
      "Aggregated 4 flagship brands under unified e-commerce experience",
      "Supported 10M+ monthly transactions during peak sales",
      "Reduced page load time by 45% through optimization",
      "Real-time inventory sync across 500+ retail stores",
    ],
  },
];

// Service Data
export const serviceData = [
  {
    name: "Full-Stack Development",
    icon: "/img/svg/web.svg",
    img: "/img/service/1.jpg",
    description: [
      "Expert full-stack development using React, Redux Toolkit, Node.js, TypeScript, and MySQL. Delivered clinical-data management platforms, energy grid balancing systems, wealth management portals, and e-commerce applications.",
      "Proven track record of improving operational efficiency by 25-40% through UI workflow redesign, data validation layer architecture, and back-end API optimisation.",
      "Experienced in leading multi-developer teams through Agile/Scrum sprints, conducting code reviews, mentoring junior developers, and delivering zero-defect releases at sprint cadence.",
    ],
  },
  {
    name: "System Architecture",
    icon: "/img/svg/cpu.svg",
    img: "/img/service/2.jpg",
    description: [
      "Design and implement scalable, high-performance system architectures. Experienced with real-time streaming pipelines (Kafka-style), GraphQL APIs, RESTful services, and complex data routing solutions.",
      "Built the INFRS17 DATA Platform - a real-time streaming and routing solution for insurance data management - and contributed to the Open Balancing Platform for automated energy supply optimisation.",
      "Strong focus on clean architecture, separation of concerns, and engineering best practices to ensure long-term maintainability and scalability of solutions.",
    ],
  },
  {
    name: "Cloud & DevOps",
    icon: "/img/svg/development.svg",
    img: "/img/service/3.jpg",
    description: [
      "Hands-on experience with Docker, Kubernetes, Azure, and GitLab CI/CD pipelines for building and deploying containerised microservices and cloud-native applications.",
      "Implement automated smoke-testing scripts, reduce post-deployment defect rates, and establish CI/CD workflows that accelerate delivery and improve software quality.",
      "Experienced in cloud infrastructure setup, container orchestration, and DevOps tooling to support Agile development teams and ensure reliable, repeatable deployments.",
    ],
  },
  {
    name: "Technical Leadership",
    icon: "/img/svg/star.svg",
    img: "/img/service/4.jpg",
    description: [
      "Lead and manage multi-developer engineering teams, conducting sprint planning, backlog grooming, code reviews, and stakeholder demos. Experienced liaising with US and European clients.",
      "Mentored teams of 5+ developers at IBM, enforcing coding standards and Agile documentation practices. Managed end-to-end client relationships at Sonata Software across two major accounts.",
      "Consistently delivered sprint tasks ahead of schedule, maintaining 100% client satisfaction ratings and improving team velocity through proactive code refactoring.",
    ],
  },
];

// Blog Data
export const blogData = [
  {
    title: "Jim Morisson Says when the musics over turn off the light",
    category: "Web Development",
    date: "02 June, 2022",
    author: "John Smith",
    img: "/img/news/1.jpg",
    description: [
      "Orido is a leading web design agency with an award-winning design team that creates innovative, effective websites that capture your brand, improve your conversion rates, and maximize your revenue to help grow your business and achieve your goals.",
      "In today's digital world, your website is the first interaction consumers have with your business. That's why almost 95 percent of a user's first impression relates to web design. It's also why web design services can have an immense impact on your company's bottom line.",
      "That's why more companies are not only reevaluating their website's design but also partnering with Orido, the web design agency that's driven more than $2.4 billion in revenue for its clients. With over 50 web design awards under our belt, we're confident we can design a custom website that drives sales for your unique business.",
    ],
  },
  {
    title: "Jim Morisson Says when the musics over turn off the light",
    category: "Web Development",
    date: "02 June, 2022",
    author: "John Smith",
    img: "/img/news/2.jpg",
    description: [
      "Orido is a leading web design agency with an award-winning design team that creates innovative, effective websites that capture your brand, improve your conversion rates, and maximize your revenue to help grow your business and achieve your goals.",
      "In today's digital world, your website is the first interaction consumers have with your business. That's why almost 95 percent of a user's first impression relates to web design. It's also why web design services can have an immense impact on your company's bottom line.",
      "That's why more companies are not only reevaluating their website's design but also partnering with Orido, the web design agency that's driven more than $2.4 billion in revenue for its clients. With over 50 web design awards under our belt, we're confident we can design a custom website that drives sales for your unique business.",
    ],
  },
  {
    title: "Jim Morisson Says when the musics over turn off the light",
    category: "Web Development",
    date: "02 June, 2022",
    author: "John Smith",
    img: "/img/news/3.jpg",
    description: [
      "Orido is a leading web design agency with an award-winning design team that creates innovative, effective websites that capture your brand, improve your conversion rates, and maximize your revenue to help grow your business and achieve your goals.",
      "In today's digital world, your website is the first interaction consumers have with your business. That's why almost 95 percent of a user's first impression relates to web design. It's also why web design services can have an immense impact on your company's bottom line.",
      "That's why more companies are not only reevaluating their website's design but also partnering with Orido, the web design agency that's driven more than $2.4 billion in revenue for its clients. With over 50 web design awards under our belt, we're confident we can design a custom website that drives sales for your unique business.",
    ],
  },
];

// Accordion Data
export const accordionData = [
  {
    title: "Agile & Architecture-First Approach",
    details:
      "I prioritize clean architecture, scalability, and maintainability. Using Agile/Scrum methodologies, I lead cross-functional teams through sprint cycles while ensuring code quality and adherence to engineering best practices. Every solution is designed with long-term growth in mind.",
  },
  {
    title: "Full-Stack Development Lifecycle",
    details:
      "From UI/UX design with React and modern frameworks, through robust backend APIs with Node.js and GraphQL, to database optimization with MySQL and cloud deployments. I manage the entire stack with TypeScript for type safety and DevOps practices for continuous deployment.",
  },
  {
    title: "Performance & Efficiency First",
    details:
      "Core value is delivering systems that work smarter, not just harder. Through UI workflow redesign, data validation layers, and API optimization, I have consistently achieved 25-40% operational efficiency improvements while maintaining code quality and team velocity.",
  },
  {
    title: "Mentorship & Team Excellence",
    details:
      "Passionate about building high-performing teams. I mentor developers, conduct thorough code reviews, establish coding standards, and foster a culture of learning. Proven track record of leading 5+ developer teams and maintaining 100% client satisfaction ratings.",
  },
];

// Counter Data
export const counterData = [
  { smallVlaue: true, value: 12, name: "Years of\nExperience" },
  { smallVlaue: true, value: 6, name: "Companies\nWorked" },
  { smallVlaue: true, value: 15, name: "Projects\nDelivered" },
];
