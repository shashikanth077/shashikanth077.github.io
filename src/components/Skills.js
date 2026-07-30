import { useEffect } from "react";
import { activeSkillProgress } from "../utilits";
import { SKILL_BAR_COLOR, skillsData, skillsIntro } from "../constants";

const SkillBar = ({ skill }) => (
  <div
    className="skillsInner___ progress_inner"
    data-value={skill.value}
    data-color={SKILL_BAR_COLOR}
  >
    <span>
      <span className="label">{skill.label}</span>
      <span className="number">{skill.value}%</span>
    </span>
    <div className="background">
      <div className="bar">
        <div className="bar_in" />
      </div>
    </div>
  </div>
);

const Skills = () => {
  useEffect(() => {
    window.addEventListener("scroll", activeSkillProgress);
  }, []);

  const leftColumn = skillsData.slice(0, 3);
  const rightColumn = skillsData.slice(3);

  return (
    <div className="devman_tm_section">
      <div className="devman_tm_skills">
        <div className="container">
          <div className="devman_tm_main_title" data-text-align="center">
            <span>{skillsIntro.eyebrow}</span>
            <h2>{skillsIntro.heading}</h2>
            <p>{skillsIntro.description}</p>
          </div>
          <div className="skills_wrapper">
            <div className="left">
              <div className="dodo_progress">
                {leftColumn.map((skill, i) => (
                  <SkillBar skill={skill} key={i} />
                ))}
              </div>
            </div>
            <div className="right">
              <div className="dodo_progress">
                {rightColumn.map((skill, i) => (
                  <SkillBar skill={skill} key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Skills;
