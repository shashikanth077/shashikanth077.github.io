import Image from "next/image";
import Popup from "./Popup";

const ServicePopup = ({ data, open, close }) => {
  return (
    <Popup open={open} close={close}>
      {data.img && (
        <Image
          className="modal-img"
          src={data.img}
          alt={data.name || ""}
          width={720}
          height={240}
        />
      )}
      <div className="modal-body">
        <h3 className="modal-title">{data.name}</h3>
        <div className="modal-text">
          {data.description &&
            data.description.map((des, i) => <p key={i}>{des}</p>)}
        </div>
      </div>
    </Popup>
  );
};
export default ServicePopup;
