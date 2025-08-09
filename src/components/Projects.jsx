import './Projects.css';
// REMOVE this:
// import LightboxImage from './LightboxImage';
// ADD this:
import InlineCarousel from './InlineCarousel';

// Desktop assets
import heroImage from '../assets/hero-image.png';
import desktopGraph from '../assets/desktop-graph.png';
import desktopGraphChange from '../assets/desktop-graph-change.png';

// Phone assets
import phoneGraph from '../assets/phone-graph.png';
import codeShot from '../assets/code.png';

export default function Projects() {
  const desktopGallery = [heroImage, desktopGraph, desktopGraphChange];
  const phoneGallery = [phoneGraph, codeShot];

  return (
    <section id="projects" className="projects">
      <h2>My Projects</h2>

      <div className="projects-grid two-cards">
        {/* Desktop box (bigger) */}
        <article className="project-card desktop">
          <div className="project-media">
            {/* SWAP LightboxImage -> InlineCarousel */}
            <InlineCarousel images={desktopGallery} alt="Desktop work" ratio="16 / 9" />
          </div>
          <div className="project-body">
            <h3 className="project-title">Desktop Web UI</h3>
            <p className="project-desc">
              Responsive desktop layouts, charts, and interactions optimized for larger screens.
            </p>
            <div className="tags">
              <span className="tag">React</span>
              <span className="tag">Vite</span>
              <span className="tag">CSS</span>
            </div>
          </div>
        </article>

        {/* Phone box (smaller) */}
        <article className="project-card mobile">
          <div className="project-media">
            <div className="phone-frame">
              {/* SWAP LightboxImage -> InlineCarousel, tall ratio */}
              <InlineCarousel images={phoneGallery} alt="Mobile work" ratio="9 / 19" showDots={false} />
            </div>
          </div>
          <div className="project-body">
            <h3 className="project-title">Mobile UI</h3>
            <p className="project-desc">
              Phone-first screens and flows with readable typography and thumb-friendly spacing.
            </p>
            <div className="tags">
              <span className="tag">Responsive</span>
              <span className="tag">UX</span>
              <span className="tag">Performance</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
