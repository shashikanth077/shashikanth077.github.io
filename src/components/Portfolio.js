import { Fragment, useState } from "react";
import DetailsPopup from "./popup/DetailsPopup";
import { portfolioData } from "../constants";

const Portfolio = () => {
  const [activeData, setActiveData] = useState(null);
  const [popup, setPopup] = useState(false);

  const openPopup = (project) => {
    setActiveData(project);
    setPopup(true);
  };

  return (
    <Fragment>
      <DetailsPopup
        open={popup}
        close={() => setPopup(false)}
        data={activeData}
      />
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
