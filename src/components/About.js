const aboutData = {
  designation: "Principal Engineer",
  title: "I Build Scalable, High-Performance Web Applications",
  text: [
    "Accomplished Principal Engineer with 12+ years of progressive experience in full-stack software development, systems architecture, and engineering team leadership across multinational organisations including Wipro, IBM, Sonata Software, and Theorem Inc.",
    "Expert in designing and delivering scalable web applications with demonstrated 25–40% operational efficiency improvements. Currently transitioning to AI Engineering, enrolling in the Master's in Engineering of Artificial Intelligence at VILNIUS TECH (VGTU), Lithuania (September 2026).",
  ],
  skillIcons: [
    { name: "frontend", icon: "/img/svg/design.svg" },
    { name: "backend", icon: "/img/svg/development.svg" },
    { name: "cloud", icon: "/img/svg/cpu.svg" },
    { name: "web", icon: "/img/svg/web.svg" },
  ],
};

const About = () => {
  return (
    <div className="devman_tm_section" id="about">
      <div className="devman_tm_about">
        <div className="container">
          <div className="about_inner">
            <div className="left">
              <div className="image_wrap">
                <img src="/img/about/1.png" alt="image" />
                <div className="main" data-img-url="/img/about/2.png" />
                <div className="extra_image">
                  <div className="image_inner">
                    <img src="/img/about/1.png" alt="" />
                    <div
                      className="main_extra"
                      data-img-url="/img/about/1.png"
                    />
                  </div>
                </div>
                {aboutData.skillIcons.map((skill, i) => (
                  <div className={i === 0 ? "extra_image" : ""} key={i}>
                    <span
                      className={`icon_${i + 1} wow fadeIn`}
                      data-wow-duration="1s"
                      data-wow-delay={`0.${i * 2}s`}
                    >
                      <img className="svg" src={skill.icon} alt="" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="right">
              <div className="title">
                <span>
                  {`I'm`} a {aboutData.designation}
                </span>
                <h3>{aboutData.title}</h3>
              </div>
              <div className="text">
                {aboutData.text.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
              <div className="devman_tm_button">
                <a className="anchor" href="#portfolio">
                  View Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default About;
