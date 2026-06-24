import { Fragment, useEffect, useRef, useState } from "react";

const accordionData = [
  {
    title: "Agile & Architecture-First Approach",
    details:
      "I prioritize clean architecture, scalability, and maintainability. Using Agile/Scrum methodologies, I lead cross-functional teams through sprint cycles while ensuring code quality and adherence to engineering best practices. Every solution is designed with long-term growth in mind.",
  },
  {
    title: "Full-Stack Development Lifecycle",
    details:
      "From UI/UX design with React and modern frameworks, through robust backend APIs with Node.js and GraphQL, to database optimization with MySQL and cloud deployments. I manage the entire stack with TypeScript for type safety and DevOps practices for continuous deployment.",
  },
  {
    title: "Performance & Efficiency First",
    details:
      "Core value is delivering systems that work smarter, not just harder. Through UI workflow redesign, data validation layers, and API optimization, I have consistently achieved 25-40% operational efficiency improvements while maintaining code quality and team velocity.",
  },
  {
    title: "Mentorship & Team Excellence",
    details:
      "Passionate about building high-performing teams. I mentor developers, conduct thorough code reviews, establish coding standards, and foster a culture of learning. Proven track record of leading 5+ developer teams and maintaining 100% client satisfaction ratings.",
  },
];

const Accordion = () => {
  const [active, setActive] = useState(null);
  const contentEl = useRef();
  useEffect(() => {
    setActive(0);
  }, [contentEl.current]);

  const onClick = (value) =>
    value === active ? setActive(null) : setActive(value);

  return (
    <Fragment>
      <div
        className="devman_tm_accordion"
        data-active={1}
        data-type="accordion"
      >
        {accordionData.map((accordion, i) => (
          <div
            className={`accordion_in ${active == i ? "acc_active" : ""}`}
            key={i}
          >
            <div className="acc_head" onClick={() => onClick(i)}>
              <span className="plus" />
              <p>{accordion.title}</p>
            </div>
            <div
              className={`acc_content d-block`}
              ref={contentEl}
              style={
                active === i
                  ? {
                      height:
                        contentEl.current && contentEl.current.scrollHeight,
                    }
                  : { height: "0px" }
              }
            >
              <div className="acc_content_in">
                <p>{accordion.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Fragment>
  );
};
export default Accordion;
