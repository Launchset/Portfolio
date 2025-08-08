import './Hero.css';
import heroImage from '../assets/hero-image.png';

function Hero() {
  return (
    <section className="hero">
    <div className="hero-main">
        <div className="hero-text">
        <span className="hero-tagline">Custom Websites • Real Results</span>
        <h1>Websites That Actually Work</h1>
        <p>
            I build fast, modern websites that are tailored to your business — for a fraction of the cost of an agency.
        </p>
        <p>
            You’ll spend less time dealing with tech headaches and more time growing your business. My sites are built to save you time, reduce admin, and actually convert visitors into clients.
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
