import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <section id="hero"><Hero /></section>
        <section id="about"><Projects /></section>
        <section id="projects"><Contact /></section>
        <section id="contact"><About /></section>
      </main>
      <Footer />
    </>
  );
}

export default App;
