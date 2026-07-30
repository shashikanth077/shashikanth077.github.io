import { homeData, sectionIds } from "../constants";
import Image from "next/image";
import Counter from "./Counter";

const Home = () => {
  return (
    <div className="devman_tm_section" id={sectionIds.home}>
      <div className="devman_tm_hero">
        <div className="background">
          <div className="image" data-img-url={homeData.backgroundImage} />
        </div>
        <div className="container">
          <div className="content">
            <div className="left">
              <div className="inner">
                <h3 className="hello">Hello {`I'm`}</h3>
                <h1 className="name">
                  {homeData.firstName} {homeData.lastName}
                </h1>
                <h3 className="job">
                  {homeData.designation} from {homeData.address}
                </h3>
                <p className="text">{homeData.bio}</p>
                <div className="buttons">
                  <div className="simple_button">
                    <a className="anchor" href={`#${sectionIds.about}`}>
                      About Me
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="stroke_1">{homeData.firstName}</h3>
              <h3 className="stroke_2">{homeData.lastName}</h3>
            </div>
            <div className="right">
              <div className="image">
                <Image
                  src={homeData.placeholderImage}
                  alt=""
                  width={400}
                  height={300}
                />
                <div className="main" data-img-url={homeData.img} />
                <span className="win">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={homeData.awardIcon} alt="" className="svg" />
                </span>
                <div className="numbers year">
                  <div className="wrapper">
                    <h3>
                      <Counter end={homeData.numberofyear} />
                    </h3>
                    <span className="item_name">
                      Years of
                      <br />
                      Success
                    </span>
                  </div>
                </div>
                <div className="numbers project">
                  <div className="wrapper">
                    <h3>
                      <Counter end={homeData.numberOfProject} />
                      <span className="extra">+</span>
                    </h3>
                    <span className="item_name">
                      Projects
                      <br />
                      Completed
                    </span>
                  </div>
                </div>
                <span className="circle anim_circle">
                  <Image
                    src={homeData.circleImage}
                    alt=""
                    width={150}
                    height={150}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
