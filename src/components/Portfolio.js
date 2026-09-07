import { Fragment, useState, useCallback } from "react";
import Image from "next/image";
import DetailsPopup from "./popup/DetailsPopup";
import { portfolioData, portfolioIntro, sectionIds } from "../constants";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/** 3D tilt effect following mouse position */
const useTilt = () => {
  const onMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  }, []);

  const onMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = "";
  }, []);

  return { onMouseMove, onMouseLeave };
};

const Portfolio = () => {
  const [activeData, setActiveData] = useState(null);
  const [popup, setPopup] = useState(false);
  const tilt = useTilt();

  const openPopup = (project) => {
    setActiveData(project);
    setPopup(true);
  };

  return (
    <Fragment>
      <DetailsPopup
        open={popup}
        close={() => setPopup(false)}
        data={activeData}
      />
      <section className="section" id={sectionIds.portfolio}>
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">{portfolioIntro.eyebrow}</span>
            <h2>{portfolioIntro.heading}</h2>
            <p>{portfolioIntro.description}</p>
          </div>
          <div className="portfolio-grid">
            {portfolioData.map((project, i) => (
              <div
                key={i}
                className={`portfolio-card reveal reveal-delay-${i + 1}`}
                onClick={() => openPopup(project)}
                onMouseMove={tilt.onMouseMove}
                onMouseLeave={tilt.onMouseLeave}
              >
                <div className="portfolio-img-wrap">
                  <Image
                    className="portfolio-img"
                    src={project.img}
                    alt={project.title}
                    width={400}
                    height={200}
                  />
                </div>
                <div className="portfolio-body">
                  <div className="portfolio-meta">
                    <span className="portfolio-date">{project.date}</span>
                    <span className="portfolio-category">{project.category}</span>
                  </div>
                  <h3 className="portfolio-card-title">{project.title}</h3>
                  <p className="portfolio-client">{project.client}</p>
                  <div className="portfolio-tech">
                    {project.tech.slice(0, 5).map((t) => (
                      <span key={t} className="tech-chip">{t}</span>
                    ))}
                    {project.tech.length > 5 && (
                      <span className="tech-chip">+{project.tech.length - 5}</span>
                    )}
                  </div>
                  <span className="portfolio-link">
                    View Details <ArrowIcon />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Fragment>
  );
};
export default Portfolio;
