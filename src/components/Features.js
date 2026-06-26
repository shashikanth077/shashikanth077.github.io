const features_list = [
  {
    title: "Full-Stack Expert",
    icon: "/img/svg/design.svg",
    text: "12+ years building end-to-end web applications using React, Redux Toolkit, Node.js, TypeScript, and MySQL — from UI design to API architecture and database optimisation.",
  },
  {
    title: "Cloud & DevOps",
    icon: "/img/svg/development.svg",
    text: "Hands-on experience with Docker, Kubernetes, and Azure for CI/CD pipelines, containerised deployments, and scalable cloud infrastructure",
  },
  {
    title: "AI Engineering",
    icon: "/img/svg/landing.svg",
    text: "Transitioning into AI Engineering with an upcoming Master's in AI at VILNIUS TECH. Skilled in AI-assisted development using GitHub Copilot and Cursor.",
  },
];
const Features = () => {
  return (
    <div className="devman_tm_section">
      <div className="devman_tm_features">
        <div className="container">
          <div className="features_list">
            <ul>
              {features_list.map((feature, i) => (
                <li
                  className="wow fadeInUp"
                  data-wow-duration="1s"
                  data-wow-delay={`"0.${i * 2}s"`}
                  key={i}
                >
                  <div className="list_inner">
                    <div className="short">
                      <div className="title">
                        <span>{`0${i + 1}`}</span>
                        <h3>{feature.title}</h3>
                      </div>
                      <div className="icon">
                        <img className="svg" src={feature.icon} alt="" />
                      </div>
                    </div>
                    <div className="text">
                      <p>{feature.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Features;
