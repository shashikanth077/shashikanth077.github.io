import Popup from "./Popup";

const DetailsPopup = ({ open, close, data }) => {
  if (!data) return null;
  return (
    <Popup open={open} close={close}>
      <div className="popup_details">
        <div className="top_image">
          <img src="/img/thumbs/4-2.png" alt="" />
          <div
            className="main"
            data-img-url={data.img}
            style={{ backgroundImage: `url("${data.img}")` }}
          />
        </div>
        <div className="portfolio_main_title">
          <h3>{data.title}</h3>
          <span>
            <a href="#" onClick={(e) => e.preventDefault()}>
              {data.category}
            </a>
          </span>
          <div />
        </div>
        <div className="main_details">
          <div className="textbox">
            {data.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {data.highlights && (
              <ul style={{ paddingLeft: "20px", marginTop: "16px" }}>
                {data.highlights.map((h, i) => (
                  <li key={i} style={{ marginBottom: "6px", color: "#54545f" }}>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="detailbox">
            <ul>
              <li>
                <span className="first">Client</span>
                <span>{data.client}</span>
              </li>
              <li>
                <span className="first">Category</span>
                <span>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    {data.category}
                  </a>
                </span>
              </li>
              <li>
                <span className="first">Timeline</span>
                <span>{data.date}</span>
              </li>
              <li>
                <span className="first">Tech Stack</span>
                <span>{data.tech}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Popup>
  );
};
export default DetailsPopup;
