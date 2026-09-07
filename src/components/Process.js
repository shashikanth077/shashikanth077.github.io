import Accordion from "./Accordion";
import { processIntro } from "../constants";

const Process = () => {
  return (
    <section className="section" style={{ background: "var(--bg-alt)" }}>
      <div className="container">
        <div className="process-grid">
          <div className="reveal">
            <span className="eyebrow">{processIntro.eyebrow}</span>
            <h2 style={{ marginBottom: 16 }}>{processIntro.heading}</h2>
            <p style={{ fontSize: "1.0625rem" }}>{processIntro.description}</p>
          </div>
          <div className="accordion-wrap reveal reveal-delay-2">
            <Accordion />
          </div>
        </div>
      </div>
    </section>
  );
};
export default Process;
