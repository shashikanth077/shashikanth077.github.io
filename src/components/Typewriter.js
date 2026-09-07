import { useState, useEffect } from "react";

const Typewriter = ({ texts, speed = 70, deleteSpeed = 35, pause = 2200 }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    if (!deleting && subIndex === texts[index].length) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }

    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(
      () => setSubIndex((prev) => prev + (deleting ? -1 : 1)),
      deleting ? deleteSpeed : speed,
    );
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, texts, speed, deleteSpeed, pause]);

  return (
    <span className="typewriter-wrap">
      {texts[index].substring(0, subIndex)}
      <span className="typewriter-cursor" aria-hidden="true">
        |
      </span>
    </span>
  );
};
export default Typewriter;
