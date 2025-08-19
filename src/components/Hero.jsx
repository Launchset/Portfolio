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
          I design fast, modern websites and booking tools built specifically for boxing gyms and coaches.
          </p>
          <p>
          Easy to use, mobile-friendly, and built to keep your classes full—without the tech headaches. You train fighters, I’ll handle the website that brings them through the door.
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