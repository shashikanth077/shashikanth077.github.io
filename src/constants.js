// Home Data
export const homeData = {
  firstName: "Shashikanth",
  lastName: "H R",
  designation: "Master's Student in AI Engineering",
  address: "Vilnius, Lithuania",
  img: "/img/hero/profile.png",
  bio: "Full-Stack & Front-End Developer with 12+ years of experience in healthcare IT, energy, banking, and e-commerce — based in Vilnius, Lithuania, currently pursuing a Master's in Engineering of Artificial Intelligence at VILNIUS TECH (VGTU). Bringing deep expertise in React, Node.js, TypeScript, and systems architecture, with a growing focus on AI model design, development, and Generative AI.",
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
    "Skilled in designing and delivering scalable web applications with demonstrated 25–40% operational efficiency improvements. Currently based in Vilnius, Lithuania, pursuing a Master's in Engineering of Artificial Intelligence at VILNIUS TECH (VGTU), and open to Front-End or Full-Stack Developer roles across the Lithuania. Authorized for full-time employment with valid Lithuanian Work Permit permit.",
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
    tech: "React · Redux · Node.js · Microservices · JavaScript · HTML5 · CSS3 · REST APIs · GitHub · Azure CI/CD",
    description: [
      "Developed Sonata Software's MFL Booking e-commerce platform using React, Redux, Node.js, Microservices, JavaScript, HTML5, and CSS3, enabling real-time vendor inventory and purchase order management.",
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
      "Expert full-stack development using React, Redux Toolkit, Node.js, TypeScript, and MySQL. Delivered clinical-data management platforms, energy grid balancing systems, wealth management portals, and e-commerce applications.",
      "Proven track record of improving operational efficiency by 25-40% through UI workflow redesign, data validation layer architecture, back-end API optimisation, and modular microservice-oriented application design.",
      "Experienced working within Agile/Scrum sprints, conducting code reviews, and delivering zero-defect releases at sprint cadence.",
    ],
  },
  {
    name: "System Architecture",
    icon: "/img/svg/cpu.svg",
    img: "/img/service/2.png",
    description: [
      "Design and develop scalable, high-performance enterprise applications with a strong focus on frontend and full-stack architecture using React, TypeScript, JavaScript, and Node.js. Experienced in designing Micro-Frontend architectures, RESTful API integrations, reusable component architectures, state management solutions, and modular application platforms.",
      "Built and contributed to large-scale enterprise applications across banking, insurance, healthcare, and e-commerce domains, working on complex business workflows, frontend modernization, API-driven applications, and scalable user interfaces.",
      "Hands-on experience with Redux Toolkit, GraphQL, Node.js, Docker, Kubernetes, Nginx, Azure, and CI/CD pipelines, providing a strong understanding of application architecture from development through deployment.",
      "Strong focus on clean architecture, separation of concerns, performance optimization, reusable design patterns, code quality, security, and engineering best practices to ensure applications remain scalable, maintainable, and reliable as products and development teams grow.",
    ],
  },
  {
    name: "Cloud & DevOps",
    icon: "/img/svg/development.svg",
    img: "/img/service/3.png",
    description: [
      "Strong hands-on knowledge of Docker, Kubernetes, Azure, Nginx, and CI/CD practices for building, packaging, and deploying modern web and microservice-based applications.",
      "Experience with GitLab CI/CD and GitHub Actions, including automated build, test, and deployment workflows to improve delivery speed, reliability, and release quality.",
      "Comfortable working with containerized environments, deployment pipelines, and DevOps tooling to support Agile teams and ensure consistent, scalable application deliveryments.",
    ],
  },
  {
    name: "Technical Leadership",
    icon: "/img/svg/star.svg",
    img: "/img/service/4.png",
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
  { label: "TypeScript", value: 85 },
  { label: "MySQL / Databases", value: 85 },
  { label: "PHP", value: 85 },
  { label: "Docker / Kubernetes", value: 75 },
  { label: "GraphQL / REST APIs", value: 70 },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Selena Brook",
    company: "ABC Studio",
    avatar: "/img/testimonials/1.jpg",
    text: "Duis aute irure dolor in repre hen derit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    name: "David Parker",
    company: "Designer",
    avatar: "/img/testimonials/3.jpg",
    text: "Duis aute irure dolor in repre hen derit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    name: "Jessica Smith",
    company: "Vivaco Group",
    avatar: "/img/testimonials/4.jpg",
    text: "Duis aute irure dolor in repre hen derit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    name: "Collin Mattew",
    company: "Photographer",
    avatar: "/img/testimonials/5.jpg",
    text: "Duis aute irure dolor in repre hen derit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
];

// Number of partner logos available at /img/partners/{light|dark}/{1..N}.png
export const PARTNERS_COUNT = 8;

// Site-wide identity/config used by the header, footer, contact section and <title>
export const siteConfig = {
  fullName: "Shashikanth Hosur Ramegowda",
  shortName: "Shashikanth H R",
  pageTitle:
    "Shashikanth Hosur Ramegowda | Full-Stack Developer | Front-End Developer | React Developer",
  cvFile: "/Shashikanth_Hosur_Ramegowda.pdf",
};

// Contact section details. Kept separate from homeData.address on purpose —
// the hero shows Shashikanth's current location, this is the mailing address
// tied to his upcoming move for the VILNIUS TECH program (see aboutData.text).
export const contactInfo = {
  address: "Saulėtekio al. 11, LT-10223 Vilnius, Lithuania",
  email: "shashikanth033@gmail.com",
  phone: "+91 8123192799",
};

// Anchor ids shared between the nav menu (navItems below) and each section's
// own `id` attribute (Home.js, About.js, Portfolio.js, Service.js, Contact.js,
// Blog.js) — update once here instead of in six different files.
export const sectionIds = {
  home: "home",
  about: "about",
  portfolio: "portfolio",
  service: "service",
  contact: "contact",
  blog: "blog",
};

// Primary navigation — consumed by both Header.js (desktop) and
// MobileHeader.js so the two menus can never drift out of sync.
export const navItems = [
  { href: `#${sectionIds.home}`, label: "Home" },
  { href: `#${sectionIds.about}`, label: "About" },
  { href: `#${sectionIds.portfolio}`, label: "Portfolio" },
  { href: `#${sectionIds.service}`, label: "Service" },
  { href: `#${sectionIds.contact}`, label: "Contact" },
  { href: siteConfig.cvFile, label: "Download CV", download: true },
];

// Shared brand assets
export const assets = {
  logoLight: "/img/logo/logoss.png",
  logoDark: "/img/logo/dark.png",
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

export const testimonialsIntro = {
  eyebrow: "Testimonial",
  heading: "What Clients Say",
  description:
    "Dliquip ex ea commo do conse namber onequa ute irure dolor in reprehen derit in voluptate",
};

export const blogIntro = {
  eyebrow: "Latest News",
  heading: "Checkout My Recent Blogs",
  description:
    "Dliquip ex ea commo do conse namber onequa ute irure dolor in reprehen derit in voluptate",
};

export const processIntro = {
  eyebrow: "Driven by Excellence",
  heading: "Engineering Solutions That Scale",
  description:
    "With 12+ years of proven expertise in full-stack development and systems architecture, I deliver high-impact solutions that improve operational efficiency by 25-40%. My approach combines technical excellence with strategic leadership.",
};

export const contactIntro = {
  eyebrow: "Don't be shy",
  heading: "Drop Me a Line",
};
