import { useEffect } from "react";
import { scrollSection, stickyNav } from "../utilits";
import { navItems, siteConfig } from "../constants";

const Header = () => {
  useEffect(() => {
    const onScroll = () => {
      stickyNav();
      scrollSection();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#home" className="header-logo">
          SH<span className="accent">R</span>
        </a>
        <nav className="header-nav">
          {navItems.map((item) => {
            if (item.href.startsWith("#")) {
              return (
                <a key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </a>
              );
            }
            return (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            );
          })}
          <a href={siteConfig.cvFile} download className="nav-cv">
            Download CV
          </a>
        </nav>
      </div>
    </header>
  );
};
export default Header;
