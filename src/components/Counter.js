import CountUp from "react-countup";
import ReactVisibilitySensor from "react-visibility-sensor";
import { timeouts } from "../constants";

const DEFAULT_COUNTER_END = 100;

const Counter = ({ end, decimals }) => {
  return (
    <CountUp
      end={end ? end : DEFAULT_COUNTER_END}
      duration={timeouts.counterDurationSec}
      decimals={decimals ? decimals : 0}
    >
      {({ countUpRef, start }) => (
        <ReactVisibilitySensor onChange={start} delayedCall>
          <span
            className="tonni_tm_counter"
            data-from="0"
            data-to={end}
            ref={countUpRef}
          >
            count
          </span>
        </ReactVisibilitySensor>
      )}
    </CountUp>
  );
};

export default Counter;
