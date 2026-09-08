import {
  careerTimeline,
  education,
  timelineIntro,
} from "../constants";

const Timeline = () => {
  return (
    <section className="section" id="timeline">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">{timelineIntro.eyebrow}</span>
          <h2>{timelineIntro.heading}</h2>
          <p>{timelineIntro.description}</p>
        </div>

        <div className="timeline">
          {careerTimeline.map((item, i) => (
            <div
              key={i}
              className={`timeline-item reveal reveal-delay-${Math.min(i + 1, 4)}`}
            >
              <div className="timeline-dot" />
              <div className="timeline-card">
                <div className="timeline-header">
                  <span className="timeline-company">
                    {item.company}
                    {item.current && (
                      <span className="timeline-current">Current</span>
                    )}
                  </span>
                  <span className="timeline-date">{item.date}</span>
                </div>
                <p className="timeline-role">{item.role}</p>
                <p className="timeline-desc">{item.description}</p>
                <div className="timeline-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="timeline-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Education Highlight */}
        <div className="education-card reveal">
          <div className="education-icon">🎓</div>
          <div className="education-degree">{education.degree}</div>
          <div className="education-school">{education.school}</div>
          <div className="education-location">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {education.location} · {education.period}
          </div>
          {education.bachelor && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
              }}
            >
              <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-heading)" }}>
                {education.bachelor.degree}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>
                {education.bachelor.school} · {education.bachelor.location} · {education.bachelor.period}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default Timeline;
