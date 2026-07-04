import Image from "next/image";
import Popup from "./Popup";

const ServicePopup = ({ data, open, close }) => {
  return (
    <Popup open={open} close={close}>
      <div className="service_popup_informations">
        <div className="image">
          <Image src="/img/thumbs/4-2.jpg" alt="" width={400} height={300} />
          <div
            className="main"
            data-img-url={data.img}
            style={{ backgroundImage: `url(${data.img})` }}
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
