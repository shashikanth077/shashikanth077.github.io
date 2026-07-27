import { useEffect } from "react";
import { scrollTop } from "../utilits";
import { SCROLL_TOP_LABEL_OFFSET } from "../constants";
const ScrollTop = () => {
  useEffect(() => {
    window.addEventListener("scroll", scrollTop);
  }, []);
  return (
    <div className="progressbar">
      <a href="#">
        <span className="text" style={{ bottom: SCROLL_TOP_LABEL_OFFSET }}>
          To Top
        </span>
      </a>
      <span className="line" />
    </div>
  );
};
export default ScrollTop;
