import Image from "next/image";
import Popup from "./Popup";
import { POPUP_PLACEHOLDER_IMAGE } from "../../constants";

const ServicePopup = ({ data, open, close }) => {
  return (
    <Popup open={open} close={close}>
      <div className="service_popup_informations">
        <div className="image">
          <Image
            src={POPUP_PLACEHOLDER_IMAGE}
            alt=""
            width={400}
            height={300}
          />
          <div
            className="main project-image"
            data-img-url={data.img || undefined}
            style={data.img ? { backgroundImage: `url(${data.img})` } : undefined}
          />
        </div>
        <div className="main_title">
          <h3>{data.name}</h3>
        </div>
        <div className="descriptions">
          {data &&
            data.description &&
            data.description.map((des, i) => <p key={i}>{des}</p>)}
        </div>
      </div>
    </Popup>
  );
};
export default ServicePopup;
