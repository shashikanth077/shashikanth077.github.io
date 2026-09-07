import { techStack, skillsIntro } from "../constants";

const Skills = () => {
  return (
    <section className="section skills">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">{skillsIntro.eyebrow}</span>
          <h2>{skillsIntro.heading}</h2>
          <p>{skillsIntro.description}</p>
        </div>
        <div className="skills-categories">
          {techStack.map((group, i) => (
            <div key={i} className={`skill-group reveal reveal-delay-${Math.min(i + 1, 4)}`}>
              <h4 className="skill-group-title">{group.category}</h4>
              <div className="skill-chips">
                {group.items.map((item) => (
                  <span key={item} className="skill-chip">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Skills;
