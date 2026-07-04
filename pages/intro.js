import Head from "next/head";
import Image from "next/image";
import Layout from "../src/layouts/Layout";
import Mouse from "../src/layouts/Mouse";
const Intro = () => {
  return (
    <Layout>
      <Head>
        <title>Devman | Intro</title>
      </Head>
      <div className="devman_tm_intro">
        <div className="devman_tm_intro_fixed_price">
          <span className="anim" />
          <span className="anim" />
          <span className="anim" />
          <a
            href="https://themeforest.net/user/codeefly/portfolio"
            target="_blank"
            rel="noreferrer"
            className="pricing-info anim"
          >
            -70%
          </a>
        </div>
        <div className="short_info">
          <Image src="/img/logo/dark.png" alt="" width={120} height={50} />
          <h3>Personal Portfolio React NextJs Template</h3>
        </div>
        <span className="intro_line" />
        <span className="intro_line_2" />
        <span className="intro_line_3" />
        <div className="demos">
          <div className="left">
            <div className="desc">
              <Image src="/img/intro/1.png" alt="" width={300} height={200} />
              <h3 className="title">Light Demo</h3>
            </div>
            <a
              className="intro_link"
              href="/"
              target="_blank"
              rel="noreferrer"
            />
          </div>
          <div className="right">
            <div className="desc">
              <Image src="/img/intro/1.png" alt="" width={300} height={200} />
              <h3 className="title">Dark Demo</h3>
            </div>
            <a
              className="intro_link"
              href="/index-dark"
              target="_blank"
              rel="noreferrer"
            />
          </div>
        </div>
      </div>
      <Mouse />
    </Layout>
  );
};
export default Intro;
