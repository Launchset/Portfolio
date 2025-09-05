import usePageTracking from "./hooks/usePageTracking";
import SiteBackground from "./components/SiteBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import About from "./components/About";
import Footer from "./components/Footer";
import ScrollUpSection from "./components/ScrollUpSection"; // 👈 swapped

function App() {
  usePageTracking();
  return (
    <>
      <SiteBackground />
      <Navbar />
      <main>
        <ScrollUpSection>
          <Hero />
        </ScrollUpSection>
        <ScrollUpSection>
          <Projects />
        </ScrollUpSection>
        <ScrollUpSection>
          <Contact />
        </ScrollUpSection>
        <ScrollUpSection>
          <About />
        </ScrollUpSection>
        <Footer />

      </main>
    </>
  );
}

export default App;
