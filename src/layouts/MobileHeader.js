import { useState, useCallback } from "react";
import { navItems, siteConfig } from "../constants";

const MobileHeader = () => {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="mobile-nav">
      <div className="mobile-bar">
        <a href="#home" className="mobile-logo">
          S<span className="accent">.</span>
        </a>
        <div
          className={`burger ${open ? "open" : ""}`}
          onClick={() => setOpen(!open)}
          role="button"
          aria-label="Toggle menu"
          tabIndex={0}
        >
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="mobile-menu-link"
            onClick={close}
          >
            {item.label}
          </a>
        ))}
        <a
          href={siteConfig.cvFile}
          download
          className="btn btn-primary"
          style={{ marginTop: 24, textAlign: "center", justifyContent: "center" }}
          onClick={close}
        >
          Download CV
        </a>
      </div>
    </div>
  );
};
export default MobileHeader;
