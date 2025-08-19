import './Hero.css';
import heroImage from '../assets/hero-image.png';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-main">
        <div className="hero-text">
          <span className="hero-tagline">Boxing Gyms • Booking Systems • Real Results</span>
          <h1>Websites & Booking Systems for Boxing Gyms</h1>
          <p>
          I design fast, modern websites and booking tools built specifically for boxing gyms and coaches.
          </p>
          <p>
          Easy to use, mobile-friendly, and built to keep your classes full—without the tech headaches. You train fighters, I’ll handle the website that brings them through the door.
          </p>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-image">
            <img src={heroImage} alt="Website Illustration" />
          </div>
        </div>
      </div>

      <div className="hero-buttons">
        <a href="#projects" className="cta-button">See My Work</a>
        <a href="#about" className="cta-secondary">Learn More</a>
      </div>
    </section>
  );
}

export default Hero;
