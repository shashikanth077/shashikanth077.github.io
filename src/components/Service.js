import { Fragment, useState } from "react";
import ServicePopup from "./popup/ServicePopup";

const serviceData = [
  {
    name: "Full-Stack Development",
    icon: "img/svg/web.svg",
    img: "img/service/1.jpg",
    description: [
      "Expert full-stack development using React, Redux Toolkit, Node.js, TypeScript, and MySQL. Delivered clinical-data management platforms, energy grid balancing systems, wealth management portals, and e-commerce applications.",
      "Proven track record of improving operational efficiency by 25-40% through UI workflow redesign, data validation layer architecture, and back-end API optimisation.",
      "Experienced in leading multi-developer teams through Agile/Scrum sprints, conducting code reviews, mentoring junior developers, and delivering zero-defect releases at sprint cadence.",
    ],
  },
  {
    name: "System Architecture",
    icon: "img/svg/cpu.svg",
    img: "img/service/2.jpg",
    description: [
      "Design and implement scalable, high-performance system architectures. Experienced with real-time streaming pipelines (Kafka-style), GraphQL APIs, RESTful services, and complex data routing solutions.",
      "Built the INFRS17 DATA Platform - a real-time streaming and routing solution for insurance data management - and contributed to the Open Balancing Platform for automated energy supply optimisation.",
      "Strong focus on clean architecture, separation of concerns, and engineering best practices to ensure long-term maintainability and scalability of solutions.",
    ],
  },
  {
    name: "Cloud & DevOps",
    icon: "img/svg/development.svg",
    img: "img/service/3.jpg",
    description: [
      "Hands-on experience with Docker, Kubernetes, Azure, and GitLab CI/CD pipelines for building and deploying containerised microservices and cloud-native applications.",
      "Implement automated smoke-testing scripts, reduce post-deployment defect rates, and establish CI/CD workflows that accelerate delivery and improve software quality.",
      "Experienced in cloud infrastructure setup, container orchestration, and DevOps tooling to support Agile development teams and ensure reliable, repeatable deployments.",
    ],
  },
  {
    name: "Technical Leadership",
    icon: "img/svg/star.svg",
    img: "img/service/4.jpg",
    description: [
      "Lead and manage multi-developer engineering teams, conducting sprint planning, backlog grooming, code reviews, and stakeholder demos. Experienced liaising with US and European clients.",
      "Mentored teams of 5+ developers at IBM, enforcing coding standards and Agile documentation practices. Managed end-to-end client relationships at Sonata Software across two major accounts.",
      "Consistently delivered sprint tasks ahead of schedule, maintaining 100% client satisfaction ratings and improving team velocity through proactive code refactoring.",
    ],
  },
];
const Service = () => {
  const [activeData, setActiveData] = useState({});
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      <ServicePopup
        open={open}
        close={() => setOpen(false)}
        data={activeData}
      />
      <div className="devman_tm_section" id="service">
        <div className="devman_tm_service">
          <div className="container">
            <div className="service_list">
              <ul>
                {serviceData.map((service, i) => (
                  <li
                    className={`wow ${i % 2 ? "fadeInLeft" : "fadeInRight"}`}
                    data-wow-duration="1s"
                    key={i}
                  >
                    <div className="list_inner">
                      <img className="svg" src={service.icon} alt="" />
                      <h3 className="title">{service.name}</h3>
                      <p className="text">
                        {service.description[0].substring(0, 138)}.
                      </p>
                      <a
                        className="devman_tm_full_link c-pointer"
                        onClick={() => {
                          setActiveData(service);
                          setOpen(true);
                        }}
                      />
                      <img
                        className="popup_service_image"
                        src="img/service/1.jpg"
                        alt=""
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="shape moving_effect"
            data-direction="y"
            data-reverse="yes"
          />
        </div>
      </div>
    </Fragment>
  );
};
export default Service;