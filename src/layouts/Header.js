import { useEffect } from "react";
import { scrollSection, stickyNav } from "../utilits";
import { assets, navItems, sectionIds } from "../constants";

const Header = () => {
  useEffect(() => {
    window.addEventListener("scroll", stickyNav);
    window.addEventListener("scroll", scrollSection);
  }, []);

  return (
    <div className="devman_tm_header">
      <div className="container">
        <div className="header_inner">
          <div className="logo">
            <a className="light" href="#">
              <img src={assets.logoLight} alt="" />
            </a>
          </div>
          <div className="menu">
            <ul className="anchor_nav">
              {navItems.map((item) => {
                const className = item.download
                  ? "download_cv"
                  : item.href === `#${sectionIds.home}`
                    ? "current"
                    : "";
                return (
                  <li key={item.href} className={className}>
                    <a href={item.href} download={item.download}>
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
