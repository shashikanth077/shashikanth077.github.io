import Image from "next/image";
import Popup from "./Popup";
import { POPUP_PLACEHOLDER_IMAGE } from "../../constants";

const BlogPopup = ({ data, open, close }) => {
  return (
    <Popup open={open} close={close}>
      <div className="news_popup_informations">
        <div className="image">
          <Image
            src={POPUP_PLACEHOLDER_IMAGE}
            alt=""
            width={400}
            height={300}
          />
          <div
            className="main popup-image-bg"
            data-img-url={data.img}
            style={{ backgroundImage: data.img ? `url(${data.img})` : undefined }}
          />
        </div>
        <div className="details">
          <h3>{data.title}</h3>
          <span>
            <a href="#">{data.category}</a>
          </span>
          <div />
        </div>
        <div className="text">
          {data &&
            data.description &&
            data.description.map((des, i) => <p key={i}>{des}</p>)}
        </div>
      </div>
    </Popup>
  );
};
export default BlogPopup;
