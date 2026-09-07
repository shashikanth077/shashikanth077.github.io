import { useEffect, useRef } from "react";

const CursorGlow = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;
    // Only show on pointer devices (not touch)
    if (window.matchMedia("(hover: none)").matches) return;

    let rafId;
    const onMove = (e) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
        el.style.opacity = "1";
      });
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div className="cursor-glow" ref={glowRef} />;
};
export default CursorGlow;
