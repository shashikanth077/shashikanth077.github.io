import { useEffect, useRef, useState } from "react";
import { accordionData } from "../constants";

const Accordion = () => {
  const [active, setActive] = useState(null);
  const refs = useRef([]);

  useEffect(() => {
    setActive(0);
  }, []);

  const toggle = (i) => setActive(active === i ? null : i);

  return (
    <div>
      {accordionData.map((item, i) => (
        <div
          key={i}
          className={`accordion-item ${active === i ? "active" : ""}`}
        >
          <div className="accordion-head" onClick={() => toggle(i)}>
            <p>{item.title}</p>
            <span className="accordion-icon" />
          </div>
          <div
            className="accordion-body"
            ref={(el) => (refs.current[i] = el)}
            style={{
              height: active === i && refs.current[i]
                ? refs.current[i].scrollHeight
                : 0,
            }}
          >
            <div className="accordion-body-inner">
              <p>{item.details}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Accordion;
