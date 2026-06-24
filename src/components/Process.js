import Accordion from "./Accordion";

const Process = () => {
  return (
    <div className="devman_tm_section">
      <div className="devman_tm_process">
        <div className="container">
          <div className="process_inner">
            <div className="left">
              <div className="devman_tm_main_title" data-text-align="left">
                <span>Driven by Excellence</span>
                <h3>Engineering Solutions That Scale</h3>
                <p>
                  With 11+ years of proven expertise in full-stack development
                  and systems architecture, I deliver high-impact solutions that
                  improve operational efficiency by 25-40%. My approach combines
                  technical excellence with strategic leadership.
                </p>
              </div>
            </div>
            <div className="right">
              <div className="acc_holder">
                <Accordion />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Process;
