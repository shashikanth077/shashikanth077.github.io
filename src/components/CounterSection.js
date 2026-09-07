import { Fragment } from "react";
import Counter from "./Counter";
import { counterData } from "../constants";

const CounterSection = () => {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {counterData.map((stat, i) => (
            <Fragment key={i}>
              {i > 0 && <div className="stat-divider" />}
              <div className="stat-item reveal">
                <div className="stat-value">
                  <Counter end={stat.value} />
                  <span className="suffix">+</span>
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
export default CounterSection;
