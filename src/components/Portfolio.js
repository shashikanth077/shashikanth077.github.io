import { Fragment, useState } from "react";
import DetailsPopup from "./popup/DetailsPopup";

const portfolioData = [
  {
    img: "/img/portfolio/1.jpg",
    category: "Clinical Data Management",
    client: "IQVIA",
    date: "2020 – 2022",
    title: "BIOS Clinical Trial Platform",
    tech: "React · Node.js · TypeScript · MySQL · REST APIs",
    description: [
      "Designed and developed IQVIA's BIOS — a comprehensive clinical trial data management platform used across multiple global study phases. The platform streamlines regulatory compliance workflows, automates complex data collection processes, and provides advanced reporting capabilities tailored for clinical researchers, data managers, and trial coordinators.",
      "Key contributions included architecting a multi-tenant data validation layer that eliminated manual entry errors, redesigning UI workflows to improve coordinator efficiency by 35%, and integrating with IQVIA's upstream clinical systems via secure REST APIs. The solution supports Preclinical through Phase IV trial stages and meets 21 CFR Part 11 compliance standards.",
    ],
    highlights: [
      "Reduced manual data entry errors by 40% through automated validation",
      "Supports Phase I–IV clinical trial lifecycle management",
      "Compliant with 21 CFR Part 11 and GDPR regulations",
      "Integrated with IQVIA's global data management ecosystem",
    ],
  },
  {
    img: "/img/portfolio/2.jpg",
    category: "Financial Technology",
    client: "New Zealand Banking Consortium",
    date: "2021 – 2023",
    title: "Banking & Investment Portal",
    tech: "React · Redux Toolkit · Node.js · GraphQL · Azure",
    description: [
      "Built an enterprise-grade banking and investment management portal for New Zealand's financial sector, enabling investment professionals to generate, manage, and distribute detailed investment reports across multiple output formats including PDF, Excel, and CSV.",
      "The platform features advanced full-text search and dynamic filtering across large financial datasets, real-time portfolio analytics dashboards, and role-based access control. Deployed on Azure with banking-grade authentication and compliance with New Zealand Financial Markets Authority (FMA) reporting requirements.",
    ],
    highlights: [
      "Multi-format report generation (PDF, Excel, CSV) at enterprise scale",
      "Advanced investment search with real-time filtering across NZ bank data",
      "Role-based access control with banking-grade security",
      "Deployed on Azure with 99.9% uptime SLA",
    ],
  },
  {
    img: "/img/portfolio/3.jpg",
    category: "E-Commerce & Retail",
    client: "Aditya Birla Fashion & Retail",
    date: "2022 – 2024",
    title: "Multi-Brand Retail Platform",
    tech: "React · Node.js · TypeScript · MySQL · Docker · Kubernetes",
    description: [
      "Developed a unified multi-brand online retail platform for Aditya Birla Fashion & Retail, one of India's largest fashion conglomerates. The platform aggregates flagship brands — Van Heusen, Allen Solly, Peter England, and Louis Philippe — under a single seamless shopping experience.",
      "Delivered AI-powered product recommendations, intelligent inventory management across 500+ retail locations, real-time order tracking, and an optimised mobile-first checkout flow that reduced cart abandonment by 28%. Handles over 100,000 daily active users with Kubernetes-based scaling.",
    ],
    highlights: [
      "Unified platform for 4+ major Aditya Birla fashion brands",
      "28% reduction in cart abandonment through optimised checkout UX",
      "Handles 100,000+ daily active users with Kubernetes-based scaling",
      "Real-time inventory sync across 500+ retail locations",
    ],
  },
];

const Portfolio = () => {
  const [activeData, setActiveData] = useState(null);
  const [popup, setPopup] = useState(false);

  const openPopup = (project) => {
    setActiveData(project);
    setPopup(true);
  };

  return (
    <Fragment>
      <DetailsPopup open={popup} close={() => setPopup(false)} data={activeData} />
      <div className="devman_tm_section" id="portfolio">
        <div className="devman_tm_portfolio">
          <div className="container">
            <div className="devman_tm_main_title" data-text-align="center">
              <span>Portfolio</span>
              <h3>Featured Projects</h3>
              <p>
                A selection of enterprise-scale products I have architected and
                delivered across healthcare, fintech, and e-commerce industries.
              </p>
            </div>
            <div className="portfolio_list">
              <ul>
                {portfolioData.map((project, i) => (
                  <li
                    key={i}
                    className="wow fadeInUp"
                    data-wow-duration="1s"
                    data-wow-delay={`0.${i * 2}s`}
                  >
                    <div className="list_inner">
                      <div
                        className="background_image"
                        data-img-url={project.img}
                      />
                      <div className="content">
                        <div className="details">
                          <span className="category">
                            <a href="#">{project.category}</a>
                          </span>
                          <h3 className="title">
                            <a href="#">{project.title}</a>
                          </h3>
                          <span className="view_project">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                openPopup(project);
                              }}
                            >
                              View Details <i className="icon-right-big" />
                            </a>
                          </span>
                        </div>
                      </div>
                      <div className="overlay" />
                      <a
                        className="devman_tm_full_link portfolio_popup c-pointer"
                        onClick={() => openPopup(project)}
                      />
                    </div>
                  </li>
                ))}
                <div
                  className="shape_1 moving_effect"
                  data-direction="y"
                  data-reverse="yes"
                />
                <div
                  className="shape_2 moving_effect"
                  data-direction="y"
                  data-reverse="yes"
                />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default Portfolio;
