import "./Hero.css";
import heroImage from "../assets/hero-image.png";

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-main">
        <div className="hero-text">
          <span className="hero-tagline">Custom Websites • Real Results</span>
          <h1>Websites & Booking Systems for Boxing Gyms</h1>
          <p>
            I build fast, mobile-friendly websites and booking systems tailored for boxing gyms and coaches.
          </p>
          <p>
            Simple to use, designed to convert, and built to keep your classes full—so you can focus on training, not tech.
          </p>

          <div className="hero-buttons">
            <a href="#projects" className="cta-button">See My Work</a>
            <a href="#contact" className="cta-secondary">Book a Free Demo</a>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-image">
            <img src={heroImage} alt="Website Illustration" />
          </div>
        </div>
      </div>
    </section>
  );
}