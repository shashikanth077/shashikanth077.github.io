import { navItems, siteConfig } from "../constants";

const Copyright = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <p className="footer-copy">
            Built by{" "}
            <a href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">
              {siteConfig.fullName}
            </a>{" "}
            &copy; {new Date().getFullYear()}
          </p>
          <div className="footer-links">
            {navItems
              .filter((item) => item.href.startsWith("#"))
              .map((item) => (
                <a key={item.href} href={item.href} className="footer-link">
                  {item.label}
                </a>
              ))}
            <a href="/tools/" className="footer-link">
              ToolNest
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Copyright;
