import './Projects.css';
import InlineCarousel from './InlineCarousel';

/* ========= Desktop images ========= */
import desktopGraph from '../assets/desktop-graph.png';
import desktopChange from '../assets/desktop-graph-change.png';
import inflationShieldDark from '../assets/inflation-shield-dark.png';
import inflationShieldLight from '../assets/inflation-shield-light.png';
import legacyDesktopHome from '../assets/Legacy-desktop-home.png';
import legacyDesktopLogin from '../assets/Legacy-desktop-login.png';
import legacyDesktopTimetable from '../assets/Legacy-desktop-timetable.png';
import legacyDesktopNew from '../assets/Legacy-desktop-newclass.png';
import legacyDesktopEdit from '../assets/Legacy-desktop-editclass.png';
import legacyDesktopInfo from '../assets/Legacy-desktop-infoclass.png';

/* ========= Phone images (now .png) ========= */
import phoneGraph from '../assets/phone-graph.png';
import legacyPhoneHome from '../assets/Legacy-phone-home.png';
import legacyPhoneHomeBottom from '../assets/Legacy-phone-homebottom.png';
import legacyPhoneMenu from '../assets/Legacy-phone-menu.png';
import legacyPhoneTimetable from '../assets/Legacy-phone-timetable.png';
import legacyPhoneLogin from '../assets/Legacy-phone-login.png';
import legacyPhoneProfile from '../assets/Legacy-phone-profile.png';
import legacyPhoneNew from '../assets/Legacy-phone-newclass.png';
import legacyPhoneEdit from '../assets/Legacy-phone-editclass.png';
import legacyPhoneInfo from '../assets/Legacy-phone-infoclass.png';

export default function Projects() {
  const desktopGallery = [
    legacyDesktopHome,
    legacyDesktopLogin,
    legacyDesktopTimetable,
    legacyDesktopNew,
    legacyDesktopEdit,
    legacyDesktopInfo,
    inflationShieldDark,
    inflationShieldLight,
    desktopGraph,
    desktopChange,
  ];

  const phoneGallery = [
    legacyPhoneHome,
    legacyPhoneHomeBottom,
    legacyPhoneMenu,
    legacyPhoneTimetable,
    legacyPhoneLogin,
    legacyPhoneProfile,
    legacyPhoneNew,
    legacyPhoneEdit,
    legacyPhoneInfo,
    phoneGraph,
  ];

  return (
    <section id="projects" className="projects">
      <h2>My Projects</h2>

      <div className="projects-grid two-cards">
        {/* Desktop box (bigger) */}
        <article className="project-card desktop">
          <div className="project-media">
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

        {/* Phone box (smaller, iPhone SE aspect) */}
        <article className="project-card mobile">
          <div className="project-media">
            <div className="phone-frame">
              <InlineCarousel images={phoneGallery} alt="Mobile work" ratio="9 / 16" showDots={false} />
            </div>
          </div>
          <div className="project-body">
            <h3 className="project-title">Mobile UI</h3>
            <p className="project-desc">
              Phone-first screens with readable type and thumb-friendly spacing.
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
