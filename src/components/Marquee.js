import { marqueeItems } from "../constants";

const Marquee = () => {
  const content = marqueeItems.map((item, i) => (
    <span key={i} className="marquee-item">
      {item}
      <span className="marquee-dot" aria-hidden="true">✦</span>
    </span>
  ));

  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-track">
        {content}
        {content}
      </div>
    </div>
  );
};
export default Marquee;
