import { useEffect } from "react";
import { scrollTopVisibility } from "../utilits";

const ScrollTop = () => {
  useEffect(() => {
    window.addEventListener("scroll", scrollTopVisibility, { passive: true });
    return () => window.removeEventListener("scroll", scrollTopVisibility);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button className="scroll-top" onClick={handleClick} aria-label="Scroll to top">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};
export default ScrollTop;
