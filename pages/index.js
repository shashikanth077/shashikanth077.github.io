import About from "../src/components/About";
import Contact from "../src/components/Contact";
import Copyright from "../src/components/Copyright";
import CounterSection from "../src/components/CounterSection";
import Features from "../src/components/Features";
import Home from "../src/components/Home";
import Marquee from "../src/components/Marquee";
import Portfolio from "../src/components/Portfolio";
import Process from "../src/components/Process";
import Service from "../src/components/Service";
import Skills from "../src/components/Skills";
import Header from "../src/layouts/Header";
import Layout from "../src/layouts/Layout";
import MobileHeader from "../src/layouts/MobileHeader";
import ScrollTop from "../src/layouts/ScrollTop";
import Seo from "../src/components/Seo";
import { siteConfig } from "../src/constants";

const Index = () => {
  return (
    <Layout>
      <Seo
        title={siteConfig.pageTitle}
        description={siteConfig.description}
        path="/"
      />
      <Header />
      <MobileHeader />
      <Home />
      <Marquee />
      <Features />
      <About />
      <CounterSection />
      <Portfolio />
      <Skills />
      <Service />
      <Process />
      <Contact />
      <Copyright />
      <ScrollTop />
    </Layout>
  );
};
export default Index;
