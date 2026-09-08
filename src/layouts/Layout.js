import Head from "next/head";
import { Fragment, useEffect } from "react";
import { initScrollReveal } from "../utilits";
import { assets } from "../constants";
import CursorGlow from "../components/CursorGlow";

const Layout = ({ children }) => {
  useEffect(() => {
    // Small delay to ensure DOM is painted before observing
    const timer = setTimeout(initScrollReveal, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Fragment>
      <Head>
        <link rel="icon" href={assets.favicon} type="image/png" />
        <link rel="shortcut icon" href={assets.favicon} />
      </Head>
      <CursorGlow />
      <div className="site-wrap">{children}</div>
    </Fragment>
  );
};
export default Layout;
