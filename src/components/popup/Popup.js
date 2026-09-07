import { useEffect, useRef } from "react";

const Popup = ({ open, close, children }) => {
  const boxRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const handleOverlayClick = (e) => {
    if (boxRef.current && !boxRef.current.contains(e.target)) {
      close();
    }
  };

  return (
    <div
      className={`modal-overlay ${open ? "open" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-box" ref={boxRef}>
        <button className="modal-close" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};
export default Popup;
