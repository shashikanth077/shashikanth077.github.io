// ===== Site Config =====
export const siteConfig = {
  fullName: "Shashikanth Hosur Ramegowda",
  shortName: "Shashikanth H R",
  pageTitle:
    "Shashikanth H R — Full-Stack Developer & AI Engineering Student",
  cvFile: "/Shashikanth_Hosur_Ramegowda.pdf",
  siteUrl: "https://shashikanth077.github.io",
  description:
    "Full-Stack Developer with 12+ years of experience in React, Node.js, PHP, and TypeScript across healthcare, banking, and e-commerce. Currently pursuing a Master's in AI Engineering at VILNIUS TECH, Vilnius, Lithuania.",
  ogImage: "/img/hero/profile.png",
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/shashikanth-hr/",
    github: "https://github.com/shashikanth077",
  },
};

// ===== Section IDs (shared between nav + each section) =====
export const sectionIds = {
  home: "home",
  about: "about",
  portfolio: "portfolio",
  service: "service",
  contact: "contact",
};

// ===== Navigation =====
export const navItems = [
  { href: `#${sectionIds.home}`, label: "Home" },
  { href: `#${sectionIds.about}`, label: "About" },
  { href: `#${sectionIds.portfolio}`, label: "Work" },
  { href: `#${sectionIds.service}`, label: "Services" },
  { href: `#${sectionIds.contact}`, label: "Contact" },
  { href: "/tools/", label: "ToolNest" },
];

// ===== Typewriter titles =====
export const heroTitles = [
  "Full-Stack Developer",
  "System Architect",
  "AI Engineering Student",
  "Technical Leader",
];

// ===== Marquee strip items =====
export const marqueeItems = [
  "React", "Node.js", "TypeScript", "Redux Toolkit", "Docker", "Kubernetes",
  "Azure", "MongoDB", "PostgreSQL", "GraphQL", "PHP", "Laravel",
  "AWS", "CI/CD", "Microservices", "Next.js", "Git", "MySQL",
];

// ===== Hero =====
export const homeData = {
  firstName: "Shashikanth",
  lastName: "H R",
  designation: "Full-Stack Developer & AI Engineering Student",
  address: "Vilnius, Lithuania",
  img: "/img/hero/profile.png",
  bio: "Full-Stack Developer with 12+ years of experience across healthcare IT, banking, insurance, and retail. Currently pursuing a Master's in AI Engineering at VILNIUS TECH. Deep expertise in React, Node.js, PHP, TypeScript, and systems architecture.",
  numberOfProject: 15,
  numberofyear: 12,
};

// ===== About =====
export const aboutData = {
  designation: "Full-Stack Developer",
  title: "I Build Scalable, High-Performance Web Applications",
  mainImage: "/img/about/1.png",
  text: [
    "Full-Stack and Front-End Developer with 12+ years of progressive experience in software development and systems architecture across multinational organisations including Wipro, IBM, Sonata Software, and Theorem Inc.",
    "Skilled in designing and delivering scalable web applications — including reducing development time by 30% through AI-assisted tooling and enabling parallel delivery across three independent teams via Micro-Frontend architecture. Currently based in Vilnius, Lithuania, pursuing a Master's in Engineering of Artificial Intelligence at VILNIUS TECH (VGTU), and open to Front-End or Full-Stack Developer roles across Lithuania.",
  ],
};

// ===== Counter / Stats =====
export const counterData = [
  { value: 12, label: "Years of\nExperience" },
  { value: 6, label: "Companies\nWorked" },
  { value: 15, label: "Projects\nDelivered" },
];

// ===== Features (Why Work With Me) =====
export const featuresData = [
  {
    title: "Full-Stack Expert",
    text: "12+ years building end-to-end web applications with React, Redux Toolkit, Node.js, PHP, TypeScript, and MySQL — from UI design to API architecture and database optimisation.",
    metric: "30% faster delivery",
  },
  {
    title: "Cloud & DevOps",
    text: "Hands-on experience with Docker, Kubernetes, and Azure for CI/CD pipelines, containerised deployments, and scalable cloud infrastructure.",
    metric: "3 parallel teams",
  },
  {
    title: "AI Engineering",
    text: "Transitioning into AI Engineering with a Master's in AI at VILNIUS TECH. Skilled in AI-assisted development using GitHub Copilot, Cursor, and Claude.",
    metric: "Master's at VILNIUS TECH",
  },
];

// ===== Portfolio / Experience =====
export const portfolioData = [
  {
    img: "/img/portfolio/1.png",
    category: "Healthcare IT",
    client: "Wipro (formerly Harman Connected Services)",
    date: "2024 – 2026",
    title: "Clinical Trial Business Rules Engine",
    tech: ["React", "Redux Toolkit", "Node.js", "MongoDB", "Micro-Frontend", "Docker", "Kubernetes"],
    description: [
      "Architected a full-stack clinical trial business rules engine using React, Redux Toolkit, Node.js, and MongoDB, improving data accuracy for healthcare IT operations.",
      "Enabled parallel deployments across 3 independent teams by implementing a Micro-Frontend architecture, and drove CI/CD pipelines using GitLab, Docker, and Kubernetes for reliable production releases.",
    ],
    highlights: [
      "Reduced development time by 30% using AI-assisted tooling",
      "Enabled parallel deployments across 3 independent teams",
      "Drove reliable CI/CD pipelines with Docker & Kubernetes",
      "Mentored developers through code reviews and sprint planning",
    ],
  },
  {
    img: "/img/portfolio/2.png",
    category: "Banking & Finance",
    client: "IBM India (Banking client)",
    date: "2021 – 2024",
    title: "Investor Advisory Portal",
    tech: ["React", "Redux Toolkit", "Node.js", "Express.js", "Material UI", "MySQL"],
    description: [
      "Delivered IBM's Investor Advisory Portal — a portfolio management and interactive dashboard platform for a banking client — using React, Redux Toolkit, Node.js, Express.js, Material UI, and MySQL.",
      "Built over a 3-year engagement at IBM, collaborating on code reviews, technical design, sprint planning, and Agile ceremonies.",
    ],
    highlights: [
      "Portfolio management and interactive dashboards",
      "Built with React, Redux Toolkit, Node.js, and MySQL",
      "Delivered alongside IBM's Open Balancing Platform",
      "Mentored 5 developers through Agile ceremonies",
    ],
  },
  {
    img: "/img/portfolio/3.png",
    category: "Retail & E-Commerce",
    client: "Sonata Software Limited",
    date: "2019 – 2021",
    title: "MFL Booking E-Commerce Platform",
    tech: ["React", "Redux", "Node.js", "PHP", "Microservices", "Azure CI/CD"],
    description: [
      "Developed Sonata Software's MFL Booking e-commerce platform using React, Redux, Node.js, PHP, and Microservices, enabling real-time vendor inventory and purchase order management.",
      "Improved order processing speed through React UI enhancements, Node.js microservices optimization, and API performance tuning.",
    ],
    highlights: [
      "Real-time vendor inventory and purchase order management",
      "Improved order processing speed via optimization",
      "Managed end-to-end delivery for two enterprise clients",
      "Reduced post-deployment defects through CI/CD improvements",
    ],
  },
];

// ===== Tech Stack (categorized) =====
export const techStack = [
  {
    category: "Frontend",
    items: ["React.js", "Redux Toolkit", "TypeScript", "JavaScript ES6+", "HTML5", "CSS3 / SASS", "Material UI", "Bootstrap"],
  },
  {
    category: "Backend",
    items: ["Node.js", "PHP", "Express.js", "Laravel", "GraphQL", "REST APIs"],
  },
  {
    category: "Database",
    items: ["MySQL", "MongoDB", "PostgreSQL"],
  },
  {
    category: "Cloud & DevOps",
    items: ["Docker", "Kubernetes", "Azure", "AWS", "GitLab CI/CD", "GitHub Actions"],
  },
  {
    category: "Tools & Methods",
    items: ["Git", "GitHub", "GitLab", "JIRA", "Agile / Scrum", "CI/CD Pipelines"],
  },
];

// ===== Services =====
export const serviceData = [
  {
    name: "Full-Stack Development",
    img: "/img/service/1.png",
    description: [
      "Expert full-stack development using React, Redux Toolkit, Node.js, PHP, TypeScript, and MySQL. Delivered clinical-data management platforms, energy grid balancing systems, wealth management portals, and e-commerce applications.",
      "Track record of measurable delivery gains — including a 30% reduction in development time through AI-assisted tooling, and improved order-processing speed through UI workflow redesign, back-end API optimisation, and modular microservice-oriented application design.",
      "Experienced working within Agile/Scrum sprints, conducting code reviews, and reducing post-deployment defects through automated smoke testing and CI/CD.",
    ],
  },
  {
    name: "System Architecture",
    img: "/img/service/2.png",
    description: [
      "Design and develop scalable, high-performance enterprise applications with a strong focus on frontend and full-stack architecture. Experienced in designing Micro-Frontend architectures, RESTful API integrations, reusable component architectures, and modular application platforms.",
      "Built and contributed to large-scale enterprise applications across banking, insurance, healthcare, and e-commerce domains, working on complex business workflows, frontend modernization, and scalable user interfaces.",
      "Strong focus on clean architecture, separation of concerns, performance optimization, reusable design patterns, and engineering best practices.",
    ],
  },
  {
    name: "Cloud & DevOps",
    img: "/img/service/3.png",
    description: [
      "Strong hands-on knowledge of Docker, Kubernetes, and Azure for building, packaging, and deploying modern web and microservice-based applications.",
      "Experience with GitLab CI/CD and GitHub/Azure CI/CD deployment pipelines, including automated smoke testing to improve delivery speed, reliability, and release quality.",
      "Comfortable working with containerized environments, deployment pipelines, and DevOps tooling to support Agile teams.",
    ],
  },
  {
    name: "Technical Leadership",
    img: "/img/service/4.png",
    description: [
      "Lead and manage multi-developer engineering teams, conducting sprint planning, code reviews, technical design, and stakeholder collaboration.",
      "Mentored teams of 5+ developers at IBM, guiding code reviews and Agile ceremonies. Managed end-to-end delivery for two enterprise clients at Sonata Software.",
      "Focused on reliable, predictable delivery — reducing post-deployment defects through automated testing and strengthening CI/CD practices across teams.",
    ],
  },
];

// ===== Process / Accordion =====
export const accordionData = [
  {
    title: "Agile & Architecture-First Approach",
    details:
      "I prioritize clean architecture, scalability, and maintainability. Using Agile/Scrum methodologies, I lead cross-functional teams through sprint cycles while ensuring code quality and adherence to engineering best practices. Every solution is designed with long-term growth in mind.",
  },
  {
    title: "Full-Stack Development Lifecycle",
    details:
      "From UI/UX design with React and modern frameworks, through robust backend APIs with Node.js, PHP and GraphQL, to database optimization with MySQL and cloud deployments. I manage the entire stack with TypeScript for type safety and DevOps practices for continuous deployment.",
  },
  {
    title: "Performance & Efficiency First",
    details:
      "Core value is delivering systems that work smarter, not just harder. Through AI-assisted tooling I've cut development time by 30% on recent projects, and through UI workflow redesign and API optimization I've improved order-processing speed and reduced post-deployment defects.",
  },
  {
    title: "Mentorship & Team Excellence",
    details:
      "Passionate about building high-performing teams. I mentor developers, conduct thorough code reviews, establish coding standards, and foster a culture of learning. Proven track record of mentoring teams of 5+ developers and leading end-to-end delivery for enterprise clients.",
  },
];

// ===== Contact =====
export const contactInfo = {
  address: "Saulėtekio al.25, LT-10225 Vilnius, Lithuania",
  email: "shashikanth033@gmail.com",
  phone: "+370 60945446",
};

export const contactIntro = {
  eyebrow: "Get In Touch",
  heading: "Let's Work Together",
};

// ===== Section Intros =====
export const portfolioIntro = {
  eyebrow: "Experience",
  heading: "Featured Projects",
  description:
    "Enterprise-scale products I've architected and delivered across healthcare, fintech, and e-commerce.",
};

export const skillsIntro = {
  eyebrow: "Tech Stack",
  heading: "Technologies I Work With",
  description:
    "12+ years of hands-on experience across the full stack — from React frontends to Node.js APIs, PHP backends, and cloud infrastructure.",
};

export const processIntro = {
  eyebrow: "My Approach",
  heading: "Engineering Solutions That Scale",
  description:
    "Combining technical excellence with strategic leadership to deliver high-impact solutions.",
};

// ===== Shared config =====
export const assets = {
  favicon: "/img/logo/fevicon.png",
};

export const fontUrl =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";

export const timeouts = {
  contactErrorClearMs: 3000,
  contactSuccessClearMs: 4000,
  counterDurationSec: 3,
};

// ===== Career Timeline =====
export const careerTimeline = [
  {
    company: "Wipro (Harman Connected Services)",
    role: "Senior Full-Stack Developer",
    date: "2024 – Present",
    current: true,
    description:
      "Architecting a clinical trial business rules engine with React, Node.js, and Micro-Frontend architecture. Reduced development time by 30% with AI-assisted tooling.",
    tags: ["React", "Node.js", "MongoDB", "Docker", "Kubernetes", "Micro-Frontend"],
  },
  {
    company: "IBM India",
    role: "Full-Stack Developer",
    date: "2021 – 2024",
    current: false,
    description:
      "Delivered the Investor Advisory Portal and Open Balancing Platform for a banking client. Mentored 5+ developers through Agile ceremonies.",
    tags: ["React", "Redux Toolkit", "Node.js", "MySQL", "Material UI"],
  },
  {
    company: "Sonata Software",
    role: "Software Developer",
    date: "2019 – 2021",
    current: false,
    description:
      "Developed the MFL Booking e-commerce platform with microservices, improving order processing speed and reducing post-deployment defects.",
    tags: ["React", "Redux", "PHP", "Microservices", "Azure CI/CD"],
  },
  {
    company: "Theorem Inc / Earlier Roles",
    role: "Software Developer",
    date: "2014 – 2019",
    current: false,
    description:
      "Built web applications across insurance and enterprise domains. Gained deep expertise in PHP, JavaScript, and relational databases.",
    tags: ["PHP", "Laravel", "JavaScript", "MySQL", "REST APIs"],
  },
];

export const education = {
  degree: "Master's in Engineering of Artificial Intelligence",
  school: "VILNIUS TECH (VGTU)",
  location: "Vilnius, Lithuania",
  status: "Currently Pursuing",
};

export const timelineIntro = {
  eyebrow: "Career Journey",
  heading: "Where I've Built & Led",
  description:
    "12+ years of progressive experience across multinational organisations — from hands-on development to system architecture and team leadership.",
};

// Placeholder images used by popups
export const POPUP_PLACEHOLDER_IMAGE = "/img/thumbs/4-2.jpg";
