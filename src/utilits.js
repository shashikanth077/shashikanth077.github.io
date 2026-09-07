/**
 * Lightweight utility functions for scroll behaviour and animations.
 * Replaces the old wowjs + custom-cursor + dataImage utilities.
 */

/** Sticky header — adds .scrolled when scrolled past 50px */
export const stickyNav = () => {
  const header = document.querySelector(".site-header");
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 50);
  }
};

/** Active nav highlighting — marks the link whose section is in view */
export const scrollSection = () => {
  const sections = document.querySelectorAll(".section[id]");
  const links = document.querySelectorAll(".nav-link");
  let currentId = "";

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.clientHeight;
    if (window.scrollY >= top - height / 3) {
      currentId = section.getAttribute("id");
    }
  });

  links.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentId}`) {
      link.classList.add("active");
    }
  });
};

/** Scroll-to-top button visibility */
export const scrollTopVisibility = () => {
  const btn = document.querySelector(".scroll-top");
  if (btn) {
    btn.classList.toggle("visible", window.scrollY > 300);
  }
};

/**
 * Intersection-Observer scroll reveal.
 * Adds .visible to every .reveal element when it enters the viewport.
 */
export const initScrollReveal = () => {
  if (typeof IntersectionObserver === "undefined") {
    // Fallback: just show everything
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
};
