const Copyright = () => {
  return (
    <div className="devman_tm_section">
      <div className="devman_tm_copyright">
        <div className="container">
          <div className="inner">
            <div className="left wow fadeInLeft" data-wow-duration="1s">
              <p>
                Developed by{" "}
                <a href="#" rel="noreferrer" target="_blank">
                  Shashikanth H R
                </a>{" "}
                © {new Date().getFullYear()}
              </p>
            </div>
            <div className="right wow fadeInRight" data-wow-duration="1s"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Copyright;
