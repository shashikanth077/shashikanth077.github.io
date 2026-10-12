import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Seo from "../src/components/Seo";
import {
  siteConfig,
  portfolioData,
  careerTimeline,
  techStack,
  contactInfo,
  education,
} from "../src/constants";
import s from "../styles/Portfolio.module.css";

function Icon({ name = "arrow", ...props }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {name === "github" ? (
        <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.8c0-1 .1-1.4-.5-2 3-.3 6.2-1.5 6.2-6.8A5.3 5.3 0 0 0 19.3 5a5 5 0 0 0-.1-3.6S18.1 1 15.4 2.8a13.4 13.4 0 0 0-6.8 0C5.9 1 4.8 1.4 4.8 1.4A5 5 0 0 0 4.7 5a5.3 5.3 0 0 0-1.4 3.7c0 5.3 3.2 6.5 6.2 6.8-.6.6-.6 1.2-.5 2v3.8" />
      ) : name === "download" ? (
        <>
          <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
        </>
      ) : name === "code" ? (
        <>
          <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />
        </>
      ) : (
        <path d="M5 19 19 5M5 5h14v14" />
      )}
    </svg>
  );
}
const External = ({ href, children, className }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
  >
    {children}
  </a>
);
const Label = ({ children }) => (
  <p className={s.label}>
    <span />
    {children}
  </p>
);

function ProjectVisual({ index }) {
  return (
    <div
      className={`${s.projectVisual} ${s[`visual${index}`]}`}
      aria-hidden="true"
    >
      <div className={s.windowBar}>
        <i />
        <i />
        <i />
        <span>
          {
            [
              "clinical / rules-engine",
              "enterprise / live-systems",
              "commerce / operations",
            ][index]
          }
        </span>
      </div>
      <div className={s.diagram}>
        <div className={s.diagramHeading}>
          <span>
            {
              [
                "Rules, connected.",
                "Complexity, balanced.",
                "Commerce, in sync.",
              ][index]
            }
          </span>
          <b>0{index + 1}</b>
        </div>
        <div className={s.nodes}>
          <span>{["Clinical data", "Live events", "Inventory"][index]}</span>
          <i>→</i>
          <span>{["Rules engine", "Streaming API", "Order API"][index]}</span>
          <i>→</i>
          <span>{["Validation", "Insights", "Fulfilment"][index]}</span>
        </div>
        <div className={s.visualLines}>
          {[42, 74, 55, 88, 68, 94, 78, 100, 85, 65, 90, 72].map(
            (height, i) => (
              <i key={i} style={{ height: `${height}%` }} />
            ),
          )}
        </div>
        <small>ARCHITECTURE CONCEPT · ILLUSTRATIVE</small>
      </div>
    </div>
  );
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        }),
      { rootMargin: "-15% 0px -55% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((section) => observer.observe(section));
    const escape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <div className={s.site}>
      <Seo
        title="Shashikanth H R | Full-Stack Engineer · 10+ Years of Experience"
        description="Full-stack engineer with 10+ years building enterprise web applications. Explore my work in healthcare, energy, banking and commerce, and my projects on GitHub."
        path="/"
      />
      <Head>
        <link rel="icon" href="/img/logo/fevicon.png" />
      </Head>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <header className={s.header}>
        <div className={s.navInner}>
          <a href="#home" className={s.logo} aria-label="Shashikanth home">
            sh<span>.</span>
            <small>ENGINEER & BUILDER</small>
          </a>
          <button
            className={s.menuButton}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "Close ×" : "Menu ☰"}
          </button>
          <nav
            id="navigation"
            className={`${s.nav} ${menuOpen ? s.navOpen : ""}`}
            aria-label="Main navigation"
          >
            {[
              ["home", "Home"],
              ["about", "About"],
              ["portfolio", "Work"],
              ["experience", "Experience"],
              ["contact", "Contact"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "location" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <External
              href={siteConfig.socialLinks.github}
              className={s.navGithub}
            >
              <Icon name="github" />
              GitHub
              <Icon width="14" />
            </External>
          </nav>
        </div>
      </header>
      <main id="main">
        <section id="home" className={`${s.hero} ${s.container}`}>
          <div className={s.heroCopy}>
            <div className={s.availability}>
              <span /> Open to opportunities <i /> Vilnius, Lithuania
            </div>
            <p className={s.intro}>HELLO, I’M SHASHIKANTH H R</p>
            <h1>
              Thoughtful code.
              <br />
              Scalable systems.
              <br />
              <em>Real-world impact.</em>
            </h1>
            <p className={s.heroDescription}>
              Full-stack engineer with <strong>10+ years of experience</strong>{" "}
              turning complex challenges into intuitive digital products. From
              enterprise platforms to tools that make everyday work simpler.
            </p>
            <div className={s.actions}>
              <a className={s.primary} href="#portfolio">
                Explore my work <Icon />
              </a>
              <External
                href={siteConfig.socialLinks.github}
                className={s.secondary}
              >
                <Icon name="github" />
                View GitHub
              </External>
            </div>
            <div className={s.heroMeta}>
              <span>REACT & NODE.JS</span>
              <i>+</i>
              <span>SYSTEM ARCHITECTURE</span>
              <i>+</i>
              <span>AI ENGINEERING</span>
            </div>
          </div>
          <div className={s.portraitArea}>
            <div className={s.portraitCard}>
              <div className={s.portraitTop}>
                <span>THE PERSON BEHIND THE CODE</span>
                <span>↗</span>
              </div>
              <div className={s.portrait}>
                <Image
                  src="/img/hero/profile.png"
                  alt="Shashikanth Hosur Ramegowda"
                  width={440}
                  height={470}
                  priority
                  objectFit="cover"
                />
              </div>
              <div className={s.portraitCaption}>
                <div>
                  <strong>Shashikanth H R</strong>
                  <span>Full-Stack Engineer & Technical Leader</span>
                </div>
                <span className={s.portraitMark}>
                  <Icon name="code" />
                </span>
              </div>
            </div>
            <div className={s.experienceBadge}>
              <strong>
                10<span>+</span>
              </strong>
              <div>
                YEARS OF EXPERIENCE
                <br />
                <span>Building. Shipping. Evolving.</span>
              </div>
            </div>
            <div className={s.locationNote}>
              <span>◎</span> Based in Vilnius. Building beyond borders.
            </div>
          </div>
        </section>
        <div className={`${s.companyStrip} ${s.container}`}>
          <p>
            EXPERIENCE ACROSS
            <br />
            <strong>GLOBAL ENGINEERING TEAMS</strong>
          </p>
          <span>
            Wipro<span className={s.companyDot}>✳</span>
          </span>
          <span className={s.ibm}>IBM</span>
          <span>
            Sonata<small>SOFTWARE</small>
          </span>
          <span className={s.theorem}>theorem.</span>
        </div>
        <section
          id="about"
          className={`${s.section} ${s.container} ${s.about}`}
        >
          <div>
            <Label>01 / A LITTLE ABOUT ME</Label>
            <h2>
              Engineering with purpose.
              <br />
              <em>Building for people.</em>
            </h2>
          </div>
          <div>
            <p className={s.largeText}>
              I connect the dots between a great user experience and the
              architecture that makes it possible.
            </p>
            <p>
              Over a decade, I’ve built web applications across healthcare,
              energy, banking, insurance, and retail. My work spans hands-on
              development, system design, and leading teams at Wipro, IBM,
              Sonata Software, and Theorem.
            </p>
            <p>
              Today, I’m expanding that foundation through a Master’s in AI
              Engineering at VILNIUS TECH, exploring the next chapter of
              intelligent software.
            </p>
            <a className={s.textLink} href={siteConfig.cvFile} download>
              Download my résumé <Icon name="download" />
            </a>
          </div>
        </section>
        <section id="portfolio" className={`${s.section} ${s.workSection}`}>
          <div className={s.container}>
            <div className={s.sectionHeading}>
              <div>
                <Label>02 / SELECTED WORK</Label>
                <h2>
                  Complex challenges.
                  <br />
                  <em>Considered solutions.</em>
                </h2>
              </div>
              <p>
                A selection of enterprise platforms I’ve helped architect,
                build, and deliver.
              </p>
            </div>
            <div className={s.projects}>
              {portfolioData.map((project, index) => (
                <article className={s.project} key={project.title}>
                  <ProjectVisual index={index} />
                  <div className={s.projectBody}>
                    <p className={s.projectEyebrow}>
                      {project.category} <span>0{index + 1}</span>
                    </p>
                    <h3>{project.title}</h3>
                    <p className={s.projectRole}>
                      {project.client} · {project.role}
                    </p>
                    <p>{project.description[0]}</p>
                    <div className={s.tags}>
                      {project.tech.slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <details className={s.details}>
                      <summary>
                        Explore case study <span>+</span>
                      </summary>
                      <div>
                        <h4>Approach & delivery</h4>
                        <p>{project.description[1]}</p>
                        <h4>Project highlights</h4>
                        <ul>
                          {project.highlights.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <p className={s.confidential}>
                          Enterprise engagement · Source code is not publicly
                          available.
                        </p>
                      </div>
                    </details>
                  </div>
                </article>
              ))}
            </div>
            <article className={s.toolnest}>
              <div>
                <span className={s.toolIcon}>
                  <Icon name="code" />
                </span>
                <Label>PERSONAL PROJECT / BUILT TO BE USEFUL</Label>
                <h3>
                  Meet ToolNest<span>.</span>
                </h3>
                <p>
                  A collection of browser tools for PDFs, images, and everyday
                  developer tasks. Less friction. More getting things done.
                </p>
                <a href="/tools/" className={s.primary}>
                  Explore ToolNest <Icon />
                </a>
              </div>
              <div className={s.toolGrid}>
                {[
                  ["PDF", "Document tools", "↗"],
                  ["IMG", "Image utilities", "◈"],
                  ["DEV", "Developer tools", "⌘"],
                  ["QR", "QR & barcodes", "▦"],
                ].map(([code, title, symbol]) => (
                  <a key={code} href="/tools/">
                    <span>
                      {code}
                      <b>{symbol}</b>
                    </span>
                    <strong>{title}</strong>
                  </a>
                ))}
              </div>
            </article>
          </div>
        </section>
        <section
          id="experience"
          className={`${s.section} ${s.container} ${s.career}`}
        >
          <div className={s.careerIntro}>
            <Label>03 / THE JOURNEY</Label>
            <h2>
              A decade of
              <br />
              <em>moving forward.</em>
            </h2>
            <p>
              From writing the first building blocks to architecting enterprise
              systems and mentoring engineering teams.
            </p>
            <div className={s.education}>
              <span>THE NEXT CHAPTER</span>
              <h3>
                Engineering
                <br />
                Artificial Intelligence
              </h3>
              <p>
                {education.school}
                <br />
                {education.period}
              </p>
              <small>Master’s degree · Currently pursuing</small>
            </div>
          </div>
          <div className={s.timeline}>
            {careerTimeline.map((job, index) => (
              <article key={job.company}>
                <span className={s.timelineDot} />
                <p className={s.jobDate}>
                  {job.date}
                  {index === 0 && <span>MOST RECENT</span>}
                </p>
                <h3>{job.role}</h3>
                <h4>{job.company}</h4>
                <p>{job.description}</p>
                <div className={s.tags}>
                  {job.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="service" className={`${s.section} ${s.stackSection}`}>
          <div className={s.container}>
            <div className={s.sectionHeading}>
              <div>
                <Label>04 / MY TOOLKIT</Label>
                <h2>
                  The right tools.
                  <br />
                  <em>A strong foundation.</em>
                </h2>
              </div>
              <p>
                From the first component to the production pipeline. Experience
                across the entire stack.
              </p>
            </div>
            <div className={s.stackGrid}>
              {techStack.map((group, index) => (
                <div key={group.category}>
                  <span className={s.stackNumber}>0{index + 1} /</span>
                  <h3>{group.category}</h3>
                  <p>{group.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          className={`${s.section} ${s.container}`}
          aria-labelledby="github-title"
        >
          <div className={s.githubPanel}>
            <div>
              <Icon name="github" width="36" height="36" />
              <Label>05 / BEHIND THE BUILD</Label>
              <h2 id="github-title">
                The work continues
                <br />
                <em>on GitHub.</em>
              </h2>
              <p>
                Explore my repositories, personal projects, and the code behind
                this portfolio.
              </p>
              <External
                href={siteConfig.socialLinks.github}
                className={s.primary}
              >
                Visit my GitHub <Icon />
              </External>
            </div>
            <div className={s.codeCard}>
              <div className={s.codeTitle}>
                <span>developer.js</span>
                <span>JavaScript</span>
              </div>
              <pre>
                <code>
                  <span>const</span>
                  {" developer = {\n  name: "}
                  <b>{'"Shashikanth H R"'}</b>
                  {",\n  experience: "}
                  <b>{'"10+ years"'}</b>
                  {",\n  focus: [\n    "}
                  <b>{'"Full-stack engineering"'}</b>
                  {",\n    "}
                  <b>{'"Scalable architecture"'}</b>
                  {",\n    "}
                  <b>{'"AI engineering"'}</b>
                  {"\n  ],\n  always: "}
                  <b>{'"Learning & building"'}</b>
                  {"\n};"}
                </code>
              </pre>
              <External href={siteConfig.socialLinks.github}>
                github.com/shashikanth077 <Icon width="16" />
              </External>
            </div>
          </div>
        </section>
        <section id="contact" className={`${s.contact} ${s.container}`}>
          <Label>HAVE SOMETHING IN MIND?</Label>
          <h2>
            Let’s build something
            <br />
            <em>that matters.</em>
            <span>↗</span>
          </h2>
          <div className={s.contactBottom}>
            <p>
              Open to full-stack and front-end engineering roles,
              <br />
              interesting projects, and meaningful conversations.
            </p>
            <a href={`mailto:${contactInfo.email}`} className={s.contactEmail}>
              {contactInfo.email}
              <Icon />
            </a>
          </div>
        </section>
      </main>
      <footer className={`${s.footer} ${s.container}`}>
        <a className={s.logo} href="#home">
          sh<span>.</span>
        </a>
        <p>© {new Date().getFullYear()} Shashikanth H R · Crafted with care.</p>
        <div>
          <External href={siteConfig.socialLinks.github}>GitHub ↗</External>
          <External href={siteConfig.socialLinks.linkedin}>LinkedIn ↗</External>
          <a href={siteConfig.cvFile} download>
            Résumé ↓
          </a>
          <a href="/tools/">ToolNest ↗</a>
        </div>
      </footer>
    </div>
  );
}
