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
        <section id="projects"><Projects /></section>
        <section id="contact"><Contact /></section>
        <section id="about"><About /></section>
      </main>
      <Footer />
    </>
  );
}

export default App;
