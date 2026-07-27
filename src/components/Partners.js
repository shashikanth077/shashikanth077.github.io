import Image from "next/image";
import { PARTNERS_COUNT } from "../constants";

const PARTNER_WOW_DELAY_STEP_SEC = 0.2;
const partnerIndexes = Array.from({ length: PARTNERS_COUNT }, (_, i) => i + 1);

const Partners = ({ dark }) => {
  return (
    <div className="devman_tm_section">
      <div className="devman_tm_partners">
        <div className="container">
          <div className="partners_inner">
            <ul>
              {partnerIndexes.map((n, i) => (
                <li key={n}>
                  <div className="list_inner">
                    <Image
                      className="wow fadeIn"
                      data-wow-duration="1s"
                      data-wow-delay={`${(i % 4) * PARTNER_WOW_DELAY_STEP_SEC}s`}
                      src={`/img/partners/${dark ? "light" : "dark"}/${n}.png`}
                      alt=""
                      width={150}
                      height={150}
                    />
                    <a className="devman_tm_full_link" href="#" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Partners;
