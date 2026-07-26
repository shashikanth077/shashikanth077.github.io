import Image from "next/image";
import Popup from "./Popup";

const DetailsPopup = ({ open, close, data }) => {
  if (!data) return null;
  return (
    <Popup open={open} close={close}>
      <div className="popup_details">
        <div className="top_image">
          <Image src="/img/thumbs/4-2.png" alt="" width={400} height={300} />
          <div className="main popup-image-bg" data-img-url={data.img} />
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
              <ul className="popup-highlights-list">
                {data.highlights.map((h, i) => (
                  <li key={i} className="popup-highlights-item">
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
