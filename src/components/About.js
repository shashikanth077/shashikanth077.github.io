import { aboutData, homeData, sectionIds } from "../constants";
import Image from "next/image";

const About = () => {
  return (
    <section className="section" id={sectionIds.about}>
      <div className="container">
        <div className="about-grid">
          <div className="about-photo-wrap reveal">
            <div className="about-photo-frame">
              <Image
                src={aboutData.mainImage}
                alt={aboutData.designation}
                width={500}
                height={625}
              />
            </div>
            <div className="about-float-card">
              <div className="about-float-number">{homeData.numberofyear}+</div>
              <span className="about-float-label">Years Experience</span>
            </div>
          </div>
          <div className="about-content reveal reveal-delay-2">
            <span className="about-tag">I&apos;m a {aboutData.designation}</span>
            <h2 className="about-title">{aboutData.title}</h2>
            <div className="about-text">
              {aboutData.text.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
            <a href={`#${sectionIds.portfolio}`} className="btn btn-primary">
              View My Work
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
export default About;
