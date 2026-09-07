import { featuresData } from "../constants";

const Features = () => {
  return (
    <section className="section features">
      <div className="container">
        <div className="features-grid">
          {featuresData.map((feature, i) => (
            <div
              key={i}
              className={`feature-card reveal reveal-delay-${i + 1}`}
            >
              <div className="feature-number">{`0${i + 1}`}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-text">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;
