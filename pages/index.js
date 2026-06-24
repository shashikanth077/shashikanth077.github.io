import dynamic from "next/dynamic";
import About from "../src/components/About";
import Contact from "../src/components/Contact";
import Copyright from "../src/components/Copyright";
import CounterSection from "../src/components/CounterSection";
import Features from "../src/components/Features";
import Home from "../src/components/Home";
import Partners from "../src/components/Partners";
import Portfolio from "../src/components/Portfolio";
import Process from "../src/components/Process";
import Service from "../src/components/Service";
import Skills from "../src/components/Skills";
// import Testimonials from "../src/components/Testimonials";
import Head from "next/head";
import Header from "../src/layouts/Header";
import Layout from "../src/layouts/Layout";
import MobileHeader from "../src/layouts/MobileHeader";
import Mouse from "../src/layouts/Mouse";
import ScrollTop from "../src/layouts/ScrollTop";
const Testimonials = dynamic(() => import("../src/components/Testimonials"), {
  ssr: false,
});
const Index = () => {
  return (
    <Layout>
      <Head>
        <title>Shashikanth H R | Principal Engineer</title>
      </Head>
      <MobileHeader />
      <Header />
      <Home />
      <Features />
      <About />
      <CounterSection />
      <Portfolio />
      <Skills />
      <Service />
      <Process />
      <Testimonials />
      <Partners />
      <Contact />
      <Copyright />
      <Mouse />
      <ScrollTop />
    </Layout>
  );
};
export default Index;
