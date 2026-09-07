import { Fragment, useState } from "react";
import ServicePopup from "./popup/ServicePopup";
import { sectionIds, serviceData } from "../constants";

const serviceIcons = [
  // Full-Stack Development
  <svg key="fs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  // System Architecture
  <svg key="sa" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>,
  // Cloud & DevOps
  <svg key="cd" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>,
  // Technical Leadership
  <svg key="tl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
];

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const Service = () => {
  const [activeData, setActiveData] = useState({});
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <ServicePopup
        open={open}
        close={() => setOpen(false)}
        data={activeData}
      />
      <section className="section" id={sectionIds.service}>
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">What I Do</span>
            <h2>Services I Offer</h2>
            <p>
              Delivering end-to-end engineering solutions — from frontend development
              and system design to cloud infrastructure and team leadership.
            </p>
          </div>
          <div className="services-grid">
            {serviceData.map((service, i) => (
              <div
                key={i}
                className={`service-card reveal reveal-delay-${Math.min(i + 1, 4)}`}
                onClick={() => {
                  setActiveData(service);
                  setOpen(true);
                }}
              >
                <div className="service-icon">{serviceIcons[i]}</div>
                <h3>{service.name}</h3>
                <p>{service.description[0].substring(0, 150)}…</p>
                <span className="read-more">
                  Learn more <ArrowIcon />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Fragment>
  );
};
export default Service;
