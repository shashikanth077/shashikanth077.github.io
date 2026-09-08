import { useEffect, useRef } from "react";

const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Skip on reduced-motion or touch-only
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let isVisible = true;
    const particles = [];
    const CONNECT_DIST = 100;
    const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;

    const resize = () => {
      const dpr = window.devicePixelRatio > 1 ? 1.5 : 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    // Reduced from 60 → 40 max for smoother scrolling
    const count = Math.min(Math.floor((w * h) / 22000), 40);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    const animate = () => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99, 102, 241, 0.35)";
        ctx.fill();
      }

      // Draw connections using squared distance (skip sqrt)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECT_DIST_SQ) {
            const alpha = 0.07 * (1 - Math.sqrt(distSq) / CONNECT_DIST);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    // Use IntersectionObserver to pause when hero is off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          animate();
        } else {
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    animate();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" />;
};
export default ParticleField;
