// ===== Site Config =====
export const siteConfig = {
  fullName: "Shashikanth Hosur Ramegowda",
  shortName: "Shashikanth H R",
  pageTitle:
    "Shashikanth H R — Full-Stack Developer | Node.js & React.js Specialist",
  cvFile: "/Shashikanth_Hosur_Ramegowda.pdf",
  siteUrl: "https://shashikanth077.github.io",
  description:
    "Full-Stack Developer with 10+ years of experience in React, Node.js, GraphQL, TypeScript, and PHP across healthcare, energy, banking, insurance, and e-commerce. Currently pursuing a Master's in AI Engineering at VILNIUS TECH, Vilnius, Lithuania.",
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
  "Node.js & React.js Specialist",
  "AI Engineering Student",
  "Technical Leader",
];

// ===== Marquee strip items =====
export const marqueeItems = [
  "React", "Node.js", "TypeScript", "Redux Toolkit", "Docker", "Kubernetes",
  "Azure", "MongoDB", "PostgreSQL", "GraphQL", "PHP", "Laravel",
  "AWS", "CI/CD", "Microservices", "Kafka", "Git", "MySQL",
];

// ===== Hero =====
export const homeData = {
  firstName: "Shashikanth",
  lastName: "H R",
  designation: "Full-Stack Developer | Node.js & React.js Specialist",
  address: "Vilnius, Lithuania",
  img: "/img/hero/profile.png",
  bio: "Full-Stack Developer with 10+ years designing and delivering scalable web applications across healthcare, energy, banking, insurance, and retail. Currently pursuing a Master's in AI Engineering at VILNIUS TECH. Proficient in React, Node.js, GraphQL, TypeScript, and systems architecture.",
  numberOfProject: 15,
  numberofyear: 10,
};

// ===== About =====
export const aboutData = {
  designation: "Full-Stack Developer",
  title: "I Build Scalable, High-Performance Web Applications",
  mainImage: "/img/about/1.png",
  text: [
    "Full-Stack Software Engineer with 10+ years of progressive experience designing and delivering scalable web applications across multinational organisations including Wipro, IBM, Sonata Software, and Theorem Inc. Most recently served as Principal Engineer at Wipro, architecting clinical trial platforms with Micro-Frontend architecture.",
    "Proficient in React, Node.js, GraphQL/REST APIs, microservices, Docker, Kubernetes, and CI/CD pipelines. Proven expertise shipping mission-critical systems including clinical trial platforms, real-time energy management systems, and investor advisory portals. Currently based in Vilnius, Lithuania, pursuing a Master's in Engineering of Artificial Intelligence at VILNIUS TECH (VGTU), and open to Full-Stack or Front-End Developer roles.",
  ],
};

// ===== Counter / Stats =====
export const counterData = [
  { value: 10, label: "Years of\nExperience" },
  { value: 6, label: "Companies\nWorked" },
  { value: 15, label: "Projects\nDelivered" },
];

// ===== Features (Why Work With Me) =====
export const featuresData = [
  {
    title: "Full-Stack Expert",
    text: "10+ years building end-to-end web applications with React, Redux Toolkit, Node.js, PHP, TypeScript, and MySQL — from UI design to API architecture and database optimisation.",
    metric: "30% faster delivery",
  },
  {
    title: "Cloud & DevOps",
    text: "Hands-on experience with Docker, Kubernetes, and Azure for CI/CD pipelines, containerised deployments, and scalable cloud infrastructure.",
    metric: "3 parallel teams",
  },
  {
    title: "AI Engineering",
    text: "Advancing into AI Engineering with a Master's at VILNIUS TECH. Skilled in AI-assisted development using GitHub Copilot, Cursor, and Claude — integrating AI into production workflows.",
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
    role: "Principal Engineer",
    tech: ["React", "Redux Toolkit", "Node.js", "MongoDB", "Micro-Frontend", "Docker", "Kubernetes"],
    description: [
      "Architected a full-stack clinical trial business rules engine using React, Redux Toolkit, Node.js, and MongoDB, improving data accuracy for healthcare IT operations.",
      "Enabled parallel deployments across 3 independent teams by implementing a Micro-Frontend architecture, and drove CI/CD pipelines using GitLab, Docker, and Kubernetes for reliable production releases.",
    ],
    highlights: [
      "Reduced development time by 30% using AI-assisted tooling (Cursor, Claude, Copilot)",
      "Enabled parallel deployments across 3 independent teams via Micro-Frontend",
      "Drove reliable CI/CD pipelines with GitLab, Docker & Kubernetes",
      "Mentored developers through code reviews, sprint planning, and technical design",
    ],
  },
  {
    img: "/img/portfolio/2.png",
    category: "Energy, Banking & Insurance",
    client: "IBM India Private Limited",
    date: "2021 – 2024",
    title: "Enterprise Platforms — Energy, Banking & Insurance",
    role: "Senior System Analyst",
    tech: ["React", "Redux Toolkit", "Node.js", "GraphQL", "TypeScript", "Kafka", "Microservices", "MySQL"],
    description: [
      "Developed the Open Balancing Platform (React, Redux Toolkit, Node.js, GraphQL, TypeScript) enabling real-time energy demand-supply balancing across energy grids.",
      "Built the IFRS 17 Data Platform (React, Node.js, TypeScript, Kafka, Microservices) delivering real-time data streaming and scalable insurance data processing. Delivered the Investor Advisory Portal (React, Node.js, Express.js, MySQL) providing portfolio management dashboards for a banking client.",
    ],
    highlights: [
      "3 major platforms: energy grid balancing, insurance data, investment advisory",
      "Real-time streaming with Kafka and Microservices architecture",
      "Built with React, Node.js, GraphQL, TypeScript, and MySQL",
      "Mentored 5 developers through Agile ceremonies and code reviews",
    ],
  },
  {
    img: "/img/portfolio/3.png",
    category: "Retail & E-Commerce",
    client: "Sonata Software Limited",
    date: "2019 – 2021",
    title: "MFL Booking E-Commerce Platform",
    role: "Senior System Analyst",
    tech: ["React", "Redux", "Node.js", "Express.js", "PHP", "REST APIs", "Azure CI/CD"],
    description: [
      "Managed full-stack development of Sonata's MFL Booking e-commerce platform using React, Redux, Node.js, Express.js, PHP, and REST APIs, enabling real-time vendor inventory and purchase order management.",
      "Improved order processing speed through React UI enhancements, Node.js optimization, and API performance tuning. Enhanced automated smoke testing and CI/CD pipelines.",
    ],
    highlights: [
      "Real-time vendor inventory and purchase order management",
      "Improved order processing speed via UI + API optimization",
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
    items: ["Node.js", "Express.js", "PHP", "Laravel", "GraphQL", "REST APIs", "Kafka", "Microservices"],
  },
  {
    category: "Database",
    items: ["MySQL", "MongoDB", "PostgreSQL", "Redis"],
  },
  {
    category: "Cloud & DevOps",
    items: ["Docker", "Kubernetes", "Azure", "AWS", "GitLab CI/CD", "GitHub Actions"],
  },
  {
    category: "Tools & Methods",
    items: ["Git", "GitHub", "GitLab", "JIRA", "Agile / Scrum", "CI/CD Pipelines", "VS Code"],
  },
  {
    category: "AI-Assisted Dev",
    items: ["GitHub Copilot", "Claude", "Cursor"],
  },
];

// ===== Services =====
export const serviceData = [
  {
    name: "Full-Stack Development",
    img: "/img/service/1.png",
    description: [
      "Expert full-stack development using React, Redux Toolkit, Node.js, PHP, TypeScript, GraphQL, and MySQL. Delivered clinical-data management platforms, real-time energy grid balancing systems, insurance data platforms, wealth management portals, and e-commerce applications.",
      "Track record of measurable delivery gains — including a 30% reduction in development time through AI-assisted tooling, and improved order-processing speed through UI workflow redesign, back-end API optimisation, and modular microservice-oriented application design.",
      "Experienced working within Agile/Scrum sprints, conducting code reviews, and reducing post-deployment defects through automated smoke testing and CI/CD.",
    ],
  },
  {
    name: "System Architecture",
    img: "/img/service/2.png",
    description: [
      "Design and develop scalable, high-performance enterprise applications with a strong focus on frontend and full-stack architecture. Experienced in designing Micro-Frontend architectures, GraphQL/REST API integrations, reusable component architectures, and modular application platforms.",
      "Built and contributed to large-scale enterprise applications across energy, banking, insurance, healthcare, and e-commerce domains, working on complex business workflows, real-time data streaming, frontend modernization, and scalable user interfaces.",
      "Strong focus on clean architecture, separation of concerns, performance optimization, reusable design patterns, and engineering best practices.",
    ],
  },
  {
    name: "Cloud & DevOps",
    img: "/img/service/3.png",
    description: [
      "Strong hands-on knowledge of Docker, Kubernetes, Azure, and AWS for building, packaging, and deploying modern web and microservice-based applications.",
      "Experience with GitLab CI/CD and GitHub/Azure CI/CD deployment pipelines, including automated smoke testing to improve delivery speed, reliability, and release quality.",
      "Comfortable working with containerized environments, deployment pipelines, and DevOps tooling to support Agile teams.",
    ],
  },
  {
    name: "Technical Leadership",
    img: "/img/service/4.png",
    description: [
      "Lead and manage multi-developer engineering teams, conducting sprint planning, code reviews, technical design, and stakeholder collaboration.",
      "Mentored teams of 5+ developers at IBM, guiding code reviews and Agile ceremonies. Managed end-to-end delivery for two enterprise clients at Sonata Software. Led architecture and team at Wipro as Principal Engineer.",
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
    "Enterprise-scale products I've architected and delivered across healthcare, energy, fintech, and e-commerce.",
};

export const skillsIntro = {
  eyebrow: "Tech Stack",
  heading: "Technologies I Work With",
  description:
    "10+ years of hands-on experience across the full stack — from React frontends to Node.js APIs, GraphQL, PHP backends, and cloud infrastructure.",
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
    role: "Principal Engineer",
    date: "Oct 2024 – Aug 2026",
    current: false,
    description:
      "Architected a full-stack clinical trial business rules engine with React, Node.js, and Micro-Frontend architecture. Reduced development time by 30% with AI-assisted tooling (Cursor, Claude, Copilot).",
    tags: ["React", "Node.js", "MongoDB", "Docker", "Kubernetes", "Micro-Frontend"],
  },
  {
    company: "IBM India Private Limited",
    role: "Senior System Analyst",
    date: "Sep 2021 – Oct 2024",
    current: false,
    description:
      "Delivered 3 enterprise platforms: Open Balancing Platform (real-time energy grids), IFRS 17 Data Platform (insurance streaming), and Investor Advisory Portal (banking dashboards). Mentored 5+ developers.",
    tags: ["React", "Redux Toolkit", "Node.js", "GraphQL", "TypeScript", "Kafka", "MySQL"],
  },
  {
    company: "Sonata Software Limited",
    role: "Senior System Analyst",
    date: "Jan 2019 – Sep 2021",
    current: false,
    description:
      "Managed full-stack development of the MFL Booking e-commerce platform. Improved order processing speed and reduced post-deployment defects through CI/CD enhancements.",
    tags: ["React", "Redux", "Node.js", "PHP", "REST APIs", "Azure CI/CD"],
  },
  {
    company: "Cryptograph Technologies",
    role: "Senior Software Developer",
    date: "Jun 2018 – Jan 2019",
    current: false,
    description:
      "Improved vendor data access efficiency through the Vendor Inquiry Tool. Refactored components to reduce technical debt and enhance sprint delivery.",
    tags: ["PHP", "CodeIgniter", "MySQL", "JavaScript"],
  },
  {
    company: "Theorem (India) Pvt Ltd",
    role: "Software Engineer",
    date: "Aug 2016 – Jun 2018",
    current: false,
    description:
      "Engineered PayPal APAC Lifecycle Email Builder using Laravel and PHP, empowering non-technical teams to create and manage scalable HTML email campaigns.",
    tags: ["Laravel", "PHP", "JavaScript", "REST APIs", "Agile Scrum"],
  },
  {
    company: "Fortunesoft IT Innovations",
    role: "Software Engineer",
    date: "Nov 2014 – Jun 2016",
    current: false,
    description:
      "Led full-stack development of Scam Book platform, reducing fraudulent activity by 25% and increasing report submissions by 30%. Deployed on AWS.",
    tags: ["PHP", "CodeIgniter", "MySQL", "JavaScript", "AWS"],
  },
];

export const education = {
  degree: "Master of Engineering in Artificial Intelligence",
  school: "VILNIUS TECH (VGTU)",
  location: "Vilnius, Lithuania",
  period: "Sep 2026 – Present",
  status: "Currently Pursuing",
  bachelor: {
    degree: "Bachelor of Engineering in Computer Science",
    school: "Visvesvaraya Technological University (VTU)",
    location: "Karnataka, India",
    period: "2009 – 2013",
  },
};

export const timelineIntro = {
  eyebrow: "Career Journey",
  heading: "Where I've Built & Led",
  description:
    "10+ years of progressive experience across multinational organisations — from hands-on development to system architecture and team leadership.",
};

// Placeholder images used by popups
export const POPUP_PLACEHOLDER_IMAGE = "/img/thumbs/4-2.jpg";
