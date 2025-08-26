import usePageTracking from "./hooks/usePageTracking";
import SiteBackground from "./components/SiteBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import About from "./components/About";
import Footer from "./components/Footer";

function App() {
  usePageTracking(); // 👈 Initialize page tracking
  return (
    <>
      <SiteBackground /> {/* ✅ Top-level, outside <main> */}
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <Contact />
        <About />
      </main>
      <Footer />
    </>
  );
}

export default App;
