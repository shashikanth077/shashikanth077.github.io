import { homeData, heroTitles, sectionIds, siteConfig } from "../constants";
import Image from "next/image";
import Counter from "./Counter";
import Typewriter from "./Typewriter";
import ParticleField from "./ParticleField";

/** Split text into staggered letter spans */
const LetterReveal = ({ text, offset = 0, className }) => (
  <span className={className}>
    {text.split("").map((ch, i) =>
      ch === " " ? (
        <span key={i}>&nbsp;</span>
      ) : (
        <span
          key={i}
          className="letter"
          style={{ animationDelay: `${(offset + i) * 0.04 + 0.3}s` }}
        >
          {ch}
        </span>
      ),
    )}
  </span>
);

const Home = () => {
  return (
    <section className="hero section" id={sectionIds.home}>
      {/* Animated aurora blobs */}
      <div className="aurora">
        <div className="aurora-blob" />
        <div className="aurora-blob" />
        <div className="aurora-blob" />
      </div>

      {/* Particle constellation */}
      <ParticleField />

      <div className="container">
        <div className="hero-inner">
          <div className="hero-text">
            <p className="hero-greeting">
              <span className="wave">👋</span>
              Hello, I&apos;m
            </p>
            <h1 className="hero-name">
              <LetterReveal text={homeData.firstName} offset={0} />{" "}
              <span className="gradient-text">{homeData.lastName}</span>
            </h1>
            <p className="hero-title">
              <Typewriter texts={heroTitles} />
            </p>
            <p className="hero-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {homeData.address}
            </p>
            <p className="hero-bio">{homeData.bio}</p>
            <div className="hero-buttons">
              <a href={`#${sectionIds.about}`} className="btn btn-primary">
                About Me
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href={siteConfig.cvFile} download className="btn btn-outline">
                Download CV
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          </div>
          <div className="hero-photo-wrap">
            <div className="hero-photo-frame float-anim">
              <Image
                src={homeData.img}
                alt={`${siteConfig.shortName} — ${homeData.designation}`}
                width={380}
                height={420}
                priority
              />
              <div className="hero-badge years">
                <span className="hero-badge-number">
                  <Counter end={homeData.numberofyear} />+
                </span>
                <span>Years of<br />Experience</span>
              </div>
              <div className="hero-badge projects">
                <span className="hero-badge-number">
                  <Counter end={homeData.numberOfProject} />+
                </span>
                <span>Projects<br />Delivered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-scroll-hint">
        <span>Scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
};
export default Home;
