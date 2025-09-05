import "./Hero.css";
import heroImage from "../assets/hero-image.webp";

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-main">
        <div className="hero-text">
          <span className="hero-tagline">Custom Websites • Real Results</span>
          <h1>Custom Websites for Small Businesses</h1>
          <p>
            I design fast, modern websites with booking tools and altomation, built specifically for small businesses.
          </p>
          <p>
            Easy to use, mobile-friendly, and built to gain customers without the tech headaches. You focus on your business, I’ll handle the website that brings people through the door.
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