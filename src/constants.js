// Home Data
export const homeData = {
  firstName: "Shashikanth",
  lastName: "H R",
  designation: "Master's Student in AI Engineering",
  address: "Vilnius, Lithuania",
  img: "/img/hero/profile.png",
  bio: "Full-Stack & Front-End Developer with 12+ years of experience in healthcare IT, energy, banking, insurance, and retail — based in Vilnius, Lithuania, currently pursuing a Master's in Engineering of Artificial Intelligence at VILNIUS TECH (VGTU). Bringing deep expertise in React, Node.js, PHP, TypeScript, and systems architecture, with a growing focus on AI model design, development, and Generative AI.",
  numberOfProject: 15,
  numberofyear: 12,
  backgroundImage: "/img/hero/1.jpg",
  placeholderImage: "/img/thumbs/53-61.jpg",
  awardIcon: "/img/svg/award.svg",
  circleImage: "/img/hero/circle.png",
};

// About Data
export const aboutData = {
  designation: "Full stack Developer/Frontend Developer",
  title: "I Build Scalable, High-Performance Web Applications",
  mainImage: "/img/about/1.png",
  overlayImage: "/img/about/2.png",
  text: [
    "Full-Stack and Front-End Developer with 12+ years of progressive experience in software development and systems architecture across multinational organisations including Wipro, IBM, Sonata Software, and Theorem Inc.",
    "Skilled in designing and delivering scalable web applications — including reducing development time by 30% through AI-assisted tooling and enabling parallel delivery across three independent teams via Micro-Frontend architecture. Currently based in Vilnius, Lithuania, pursuing a Master's in Engineering of Artificial Intelligence at VILNIUS TECH (VGTU), and open to Front-End or Full-Stack Developer roles across Lithuania. Authorized for full-time employment with a valid Lithuanian Work Permit.",
  ],
  skillIcons: [
    { name: "frontend", icon: "/img/svg/design.svg" },
    { name: "backend", icon: "/img/svg/development.svg" },
    { name: "cloud", icon: "/img/svg/cpu.svg" },
    { name: "web", icon: "/img/svg/web.svg" },
  ],
};

// Portfolio Data — kept aligned to what's actually stated in the resume
// (see C:\Shashikanth_Data\VGTU\JobResumes\ShashikanthHosurRamegowdaResume_Fullstack_01.pdf)
export const portfolioData = [
  {
    img: "/img/portfolio/1.png",
    category: "Healthcare IT",
    client: "Wipro (formerly Harman Connected Services)",
    date: "2024 – 2026",
    title: "Clinical Trial Business Rules Engine",
    tech: "React · Redux Toolkit · Node.js · MongoDB · Micro-Frontend · GitLab CI/CD · Docker · Kubernetes",
    description: [
      "Architected a full-stack clinical trial business rules engine using React, Redux Toolkit, Node.js, and MongoDB, improving data accuracy for healthcare IT operations.",
      "Enabled parallel deployments across 3 independent teams by implementing a Micro-Frontend architecture, and drove CI/CD pipelines using GitLab, Docker, and Kubernetes for reliable production releases. Leveraged AI tools (Cursor, Claude, GitHub Copilot) to reduce development time by 30%.",
    ],
    highlights: [
      "Reduced development time by 30% using AI-assisted tooling (Cursor, Claude, GitHub Copilot)",
      "Enabled parallel deployments across 3 independent teams via Micro-Frontend architecture",
      "Drove reliable CI/CD pipelines using GitLab, Docker, and Kubernetes",
      "Mentored developers through code reviews, sprint planning, and technical design",
    ],
  },
  {
    img: "/img/portfolio/2.png",
    category: "Banking & Financial Services",
    client: "IBM India (Banking client)",
    date: "2021 – 2024",
    title: "Investor Advisory Portal",
    tech: "React · Redux Toolkit · Node.js · Express.js · REST APIs · Material UI · MySQL",
    description: [
      "Delivered IBM's Investor Advisory Portal — a portfolio management and interactive dashboard platform for a banking client — using React, Redux Toolkit, Node.js, Express.js, Material UI, and MySQL.",
      "Built over a 3-year engagement at IBM, collaborating on code reviews, technical design, sprint planning, and Agile ceremonies using JIRA and Scrum.",
    ],
    highlights: [
      "Portfolio management and interactive dashboards for a banking client",
      "Built with React, Redux Toolkit, Node.js, Express.js, Material UI, and MySQL",
      "Delivered alongside IBM's Open Balancing Platform and IFRS 17 Data Platform engagements",
      "Mentored 5 developers through code reviews and Agile ceremonies",
    ],
  },
  {
    img: "/img/portfolio/3.png",
    category: "Retail & E-Commerce",
    client: "Sonata Software Limited",
    date: "2019 – 2021",
    title: "MFL Booking E-Commerce Platform",
    tech: "React · Redux · Node.js · PHP · Microservices · JavaScript · HTML5 · CSS3 · REST APIs · GitHub · Azure CI/CD",
    description: [
      "Developed Sonata Software's MFL Booking e-commerce platform using React, Redux, Node.js, PHP, Microservices, JavaScript, HTML5, and CSS3, enabling real-time vendor inventory and purchase order management.",
      "Improved order processing speed through React UI enhancements, Node.js microservices optimization, and API performance tuning, while supporting end-to-end delivery for two enterprise retail clients.",
    ],
    highlights: [
      "Real-time vendor inventory and purchase order management",
      "Improved order processing speed via UI and microservices optimization",
      "Managed end-to-end delivery for two enterprise retail clients",
      "Enhanced automated smoke testing and GitHub/Azure CI/CD pipelines, reducing post-deployment defects",
    ],
  },
];

// Service Data
export const serviceData = [
  {
    name: "Full-Stack Development",
    icon: "/img/svg/web.svg",
    img: "/img/service/1.png",
    description: [
      "Expert full-stack development using React, Redux Toolkit, Node.js, PHP, TypeScript, and MySQL. Delivered clinical-data management platforms, energy grid balancing systems, wealth management portals, and e-commerce applications.",
      "Track record of measurable delivery gains — including a 30% reduction in development time through AI-assisted tooling, and improved order-processing speed through UI workflow redesign, back-end API optimisation, and modular microservice-oriented application design.",
      "Experienced working within Agile/Scrum sprints, conducting code reviews, and reducing post-deployment defects through automated smoke testing and CI/CD.",
    ],
  },
  {
    name: "System Architecture",
    icon: "/img/svg/cpu.svg",
    img: "/img/service/2.png",
    description: [
      "Design and develop scalable, high-performance enterprise applications with a strong focus on frontend and full-stack architecture using React, TypeScript, JavaScript, and Node.js. Experienced in designing Micro-Frontend architectures, RESTful API integrations, reusable component architectures, state management solutions, and modular application platforms.",
      "Built and contributed to large-scale enterprise applications across banking, insurance, healthcare, and e-commerce domains, working on complex business workflows, frontend modernization, API-driven applications, and scalable user interfaces.",
      "Hands-on experience with Redux Toolkit, GraphQL, Node.js, PHP, Docker, Kubernetes, Azure, and CI/CD pipelines, providing a strong understanding of application architecture from development through deployment.",
      "Strong focus on clean architecture, separation of concerns, performance optimization, reusable design patterns, code quality, and engineering best practices to ensure applications remain scalable, maintainable, and reliable as products and development teams grow.",
    ],
  },
  {
    name: "Cloud & DevOps",
    icon: "/img/svg/development.svg",
    img: "/img/service/3.png",
    description: [
      "Strong hands-on knowledge of Docker, Kubernetes, and Azure for building, packaging, and deploying modern web and microservice-based applications.",
      "Experience with GitLab CI/CD and GitHub/Azure CI/CD deployment pipelines, including automated smoke testing to improve delivery speed, reliability, and release quality.",
      "Comfortable working with containerized environments, deployment pipelines, and DevOps tooling to support Agile teams and ensure consistent, scalable application delivery.",
    ],
  },
  {
    name: "Technical Leadership",
    icon: "/img/svg/star.svg",
    img: "/img/service/4.png",
    description: [
      "Lead and manage multi-developer engineering teams, conducting sprint planning, code reviews, technical design, and stakeholder collaboration.",
      "Mentored teams of 5+ developers at IBM, guiding code reviews and Agile ceremonies. Managed end-to-end delivery for two enterprise clients at Sonata Software.",
      "Focused on reliable, predictable delivery — reducing post-deployment defects through automated testing and strengthening CI/CD practices across teams.",
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
      "From UI/UX design with React and modern frameworks, through robust backend APIs with Node.js,PHP and GraphQL, to database optimization with MySQL and cloud deployments. I manage the entire stack with TypeScript for type safety and DevOps practices for continuous deployment.",
  },
  {
    title: "Performance & Efficiency First",
    details:
      "Core value is delivering systems that work smarter, not just harder. Through AI-assisted tooling I've cut development time by 30% on recent projects, and through UI workflow redesign and API optimization I've improved order-processing speed and reduced post-deployment defects — all while maintaining code quality and team velocity.",
  },
  {
    title: "Mentorship & Team Excellence",
    details:
      "Passionate about building high-performing teams. I mentor developers, conduct thorough code reviews, establish coding standards, and foster a culture of learning. Proven track record of mentoring teams of 5+ developers and leading end-to-end delivery for enterprise clients.",
  },
];

// Counter Data
export const counterData = [
  { smallValue: true, value: 12, name: "Years of\nExperience" },
  { smallValue: true, value: 6, name: "Companies\nWorked" },
  { smallValue: true, value: 15, name: "Projects\nDelivered" },
];

// Features Data (home page "why work with me" cards)
export const featuresData = [
  {
    title: "Full-Stack Expert",
    icon: "/img/svg/design.svg",
    text: "12+ years building end-to-end web applications using React, Redux Toolkit, Node.js, PHP, TypeScript, and MySQL — from UI design to API architecture and database optimisation.",
  },
  {
    title: "Cloud & DevOps",
    icon: "/img/svg/development.svg",
    text: "Hands-on experience with Docker, Kubernetes, and Azure for CI/CD pipelines, containerised deployments, and scalable cloud infrastructure",
  },
  {
    title: "AI Engineering",
    icon: "/img/svg/landing.svg",
    text: "Transitioning into AI Engineering with an upcoming Master's in AI at VILNIUS TECH. Skilled in AI-assisted development using GitHub Copilot and Cursor.",
  },
];

// Skills Data — rendered as two columns (first 3 left, rest right), see Skills.js
export const SKILL_BAR_COLOR = "#142eb5";
export const skillsData = [
  { label: "React.js / Redux", value: 95 },
  { label: "Node.js", value: 90 },
  { label: "JavaScript / TypeScript / ES6", value: 85 },
  { label: "MySQL / MongoDB / PostgreSQL", value: 85 },
  { label: "PHP", value: 90 },
  { label: "Docker / Kubernetes", value: 75 },
  { label: "GraphQL / REST APIs", value: 70 },
  { label: "Laravel Framework", value: 85 },
  { label: "HTML5 / CSS3 / SASS / Bootstrap / Material-UI", value: 90 },
  { label: "Git / GitHub / GitLab", value: 90 },
  { label: "Azure / AWS / Cloud Services", value: 75 },
  { label: "Agile / Scrum / CI/CD", value: 80 },
];

// Number of partner logos available at /img/partners/{light|dark}/{1..N}.png
export const PARTNERS_COUNT = 8;

// Site-wide identity/config used by the header, footer, contact section and <title>
export const siteConfig = {
  fullName: "Shashikanth Hosur Ramegowda",
  shortName: "Shashikanth H R",
  pageTitle:
    "Shashikanth Hosur Ramegowda | PHP Developer | Full-Stack Developer | Front-End Developer | Node.js/React Developer",
  cvFile: "/Shashikanth_Hosur_Ramegowda.pdf",
  siteUrl: "https://shashikanth077.github.io",
  description:
    "Shashikanth Hosur Ramegowda is a PHP, Full-Stack & Front-End Developer with 12+ years of experience in React, Node.js, and TypeScript across healthcare, banking, and e-commerce, based in Vilnius, Lithuania.",
  // Existing hero photo, reused as the social share preview image.
  // A dedicated 1200x630 banner would render better on social cards, but none exists yet.
  ogImage: "/img/hero/profile.png",
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/shashikanth-hr/",
  },
};

// Contact section details. Kept separate from homeData.address on purpose —
// the hero shows Shashikanth's current location, this is the mailing address
// tied to his upcoming move for the VILNIUS TECH program (see aboutData.text).
export const contactInfo = {
  address: "Saulėtekio al.25, LT-10225 Vilnius, Lithuania",
  email: "shashikanth033@gmail.com",
  phone: "+370 60945446",
};

// Anchor ids shared between the nav menu (navItems below) and each section's
// own `id` attribute (Home.js, About.js, Portfolio.js, Service.js, Contact.js)
// — update once here instead of in five different files.
export const sectionIds = {
  home: "home",
  about: "about",
  portfolio: "portfolio",
  service: "service",
  contact: "contact",
};

// Primary navigation — consumed by both Header.js (desktop) and
// MobileHeader.js so the two menus can never drift out of sync.
export const navItems = [
  { href: `#${sectionIds.home}`, label: "Home" },
  { href: `#${sectionIds.about}`, label: "About" },
  { href: `#${sectionIds.portfolio}`, label: "Portfolio" },
  { href: `#${sectionIds.service}`, label: "Service" },
  { href: `#${sectionIds.contact}`, label: "Contact" },
  // Real page, not an in-page anchor. scrollSection() only ever matches
  // "#"-prefixed hrefs, so this entry is simply never marked current.
  // Named after the platform's own brand (see tools/libs/tools-core/src/brand.ts,
  // productName) rather than the generic "Tools" — it's a self-built product,
  // not a link to a third-party page.
  { href: "/tools/", label: "ToolNest" },
  { href: siteConfig.cvFile, label: "Download CV", download: true },
];

// Shared brand assets
export const assets = {
  logoLight: "/img/logo/logo.png",
  logoDark: "/img/logo/logo.png",
  favicon: "/img/logo/fevicon.png",
};

export const fontUrls = {
  barlow:
    "https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
  openSans:
    "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap",
};

// Shared timing values so related magic numbers live in one place
export const timeouts = {
  contactErrorClearMs: 3000,
  contactSuccessClearMs: 4000,
  linkInterceptDelayMs: 1500, // ImageView/VideoPopup: wait for content to mount before hijacking <a> tags
  preloaderFadeMs: 800,
  preloaderRemoveMs: 2000,
  bodyOpenDelayMs: 3000,
  counterDurationSec: 3,
};

// wow.js stagger delay used by list animations (About/Blog/Portfolio)
export const WOW_DELAY_STEP_SEC = 0.2;
export const wowDelay = (index) => `${index * WOW_DELAY_STEP_SEC}s`;

// Hostnames VideoPopup treats as embeddable media links
export const videoHosts = {
  youtube: "www.youtube.com",
  vimeo: "vimeo.com",
  soundcloud: "soundcloud.com",
};

// Shared placeholder thumbnail used by popups before their real background
// image (data.img) is applied — see BlogPopup.js, DetailsPopup.js, ServicePopup.js
export const POPUP_PLACEHOLDER_IMAGE = "/img/thumbs/4-2.jpg";

// Placeholder thumbnail for each blog list card, see Blog.js
export const BLOG_THUMBNAIL_PLACEHOLDER = "/img/thumbs/42-29.jpg";

// "To Top" label vertical offset, shared by ScrollTop.js
export const SCROLL_TOP_LABEL_OFFSET = "150.75px";

// Section intro copy (eyebrow + heading + optional description)
export const portfolioIntro = {
  eyebrow: "Portfolio",
  heading: "Featured Projects",
  description:
    "A selection of enterprise-scale products I have architected and delivered across healthcare, fintech, and e-commerce industries.",
};

export const skillsIntro = {
  eyebrow: "My Skills",
  heading: "Technologies I Work With — Full Stack Expert",
  description:
    "12+ years of hands-on experience across the full stack — from React frontends to Node.js APIs, PHP backends, cloud infrastructure, and DevOps.",
};

export const processIntro = {
  eyebrow: "Driven by Excellence",
  heading: "Engineering Solutions That Scale",
  description:
    "With 12+ years of proven expertise in full-stack development and systems architecture, I deliver high-impact solutions — from a 30% reduction in development time through AI-assisted tooling to reduced post-deployment defects through stronger CI/CD practices. My approach combines technical excellence with strategic leadership.",
};

export const contactIntro = {
  eyebrow: "Don't be shy",
  heading: "Drop Me a Line",
};
