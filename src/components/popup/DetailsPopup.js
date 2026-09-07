import Image from "next/image";
import Popup from "./Popup";

const DetailsPopup = ({ open, close, data }) => {
  if (!data) return null;
  return (
    <Popup open={open} close={close}>
      <Image
        className="modal-img"
        src={data.img}
        alt={data.title}
        width={720}
        height={240}
      />
      <div className="modal-body">
        <h3 className="modal-title">{data.title}</h3>
        <p className="modal-subtitle">{data.category} · {data.date}</p>
        <div className="modal-text">
          {data.description.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        {data.highlights && (
          <ul className="modal-highlights">
            {data.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
        <div className="modal-meta">
          <div className="modal-meta-item">
            <div className="modal-meta-label">Client</div>
            <div className="modal-meta-value">{data.client}</div>
          </div>
          <div className="modal-meta-item">
            <div className="modal-meta-label">Category</div>
            <div className="modal-meta-value">{data.category}</div>
          </div>
          <div className="modal-meta-item">
            <div className="modal-meta-label">Timeline</div>
            <div className="modal-meta-value">{data.date}</div>
          </div>
          <div className="modal-meta-item">
            <div className="modal-meta-label">Tech Stack</div>
            <div className="modal-meta-value">{data.tech.join(" · ")}</div>
          </div>
        </div>
      </div>
    </Popup>
  );
};
export default DetailsPopup;
