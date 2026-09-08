import { useCallback } from "react";
import { featuresData } from "../constants";

const Features = () => {
  /** Mouse-tracking spotlight for each card */
  const onMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <section className="section features">
      <div className="container">
        <div className="features-grid">
          {featuresData.map((feature, i) => (
            <div
              key={i}
              className={`feature-card reveal reveal-delay-${i + 1}`}
              onMouseMove={onMouseMove}
            >
              <div className="feature-number">{`0${i + 1}`}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-text">{feature.text}</p>
              {feature.metric && (
                <span className="feature-metric">{feature.metric}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;
