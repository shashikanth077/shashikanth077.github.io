import Head from "next/head";
import { Fragment, useEffect } from "react";
import ImageView from "../components/popup/ImageView";
import VideoPopup from "../components/popup/VideoPopup";
import Preloader from "../layouts/Preloader";
import {
  dataImage,
  devman_tm_moving_animation,
  imgToSVG,
  wowJsAnimation,
} from "../utilits";
import { assets, fontUrls } from "../constants";
const Layout = ({ children }) => {
  useEffect(() => {
    dataImage();
    imgToSVG();
    wowJsAnimation();
    devman_tm_moving_animation();
  }, []);

  return (
    <Fragment>
      <Head>
        <link href={fontUrls.barlow} rel="stylesheet" />
        <link href={fontUrls.openSans} rel="stylesheet" />
        <link rel="icon" href={assets.favicon} type="image/png" />
        <link rel="shortcut icon" href={assets.favicon} />
      </Head>
      <Preloader />
      <VideoPopup />
      <ImageView />
      {/* /PRELOADER */}
      {/* WRAPPER ALL */}
      <div className="devman_tm_all_wrap" data-magic-cursor="show">
        {children}
      </div>
    </Fragment>
  );
};
export default Layout;
