import './Projects.css';
import InlineCarousel from './InlineCarousel.jsx';
import LightboxPortal from './LightboxPortal.jsx';   // <-- ADD THIS

/* imports — your existing image imports here ... */

import { useState } from 'react';

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
  const desktopSlides = [
    { img: legacyDesktopHome, title: 'Marketing Home', blurb: 'Hero, value props, and CTA tuned for conversions.' },
    { img: legacyDesktopLogin, title: 'Secure Login', blurb: 'Auth screen with error states and password UX that doesn’t make users cry.' },
    { img: legacyDesktopTimetable, title: 'Timetable', blurb: 'Filterable class schedule with clear capacity and waitlist cues.' },
    { img: legacyDesktopNew, title: 'Create Class', blurb: 'Admin flow for creating classes in under 30 seconds.' },
    { img: legacyDesktopEdit, title: 'Edit Class', blurb: 'Inline editing with validation and instant feedback.' },
    { img: legacyDesktopInfo, title: 'Class Info', blurb: 'At-a-glance details: coach, level, capacity, and rules.' },
    { img: inflationShieldDark, title: 'Inflation Shield (Dark)', blurb: 'Data viz module showing cash erosion vs investments.' },
    { img: inflationShieldLight, title: 'Inflation Shield (Light)', blurb: 'Accessible light theme with the same insights.' },
    { img: desktopGraph, title: 'Growth Dashboard', blurb: 'KPIs and charts that actually help decisions.' },
    { img: desktopChange, title: 'Scenario Compare', blurb: 'Side-by-side projections to test strategy changes.' },
  ];

  const phoneSlides = [
    { img: legacyPhoneHome, title: 'Mobile Home', blurb: 'Fast, thumb-friendly landing for quick actions.' },
    { img: legacyPhoneHomeBottom, title: 'Feature Strip', blurb: 'Benefits + trust signals for on-the-go users.' },
    { img: legacyPhoneMenu, title: 'Slide-Out Menu', blurb: 'Simple IA: Home, Timetable, Memberships.' },
    { img: legacyPhoneTimetable, title: 'Mobile Timetable', blurb: 'One-handed browsing; day tabs + filter.' },
    { img: legacyPhoneLogin, title: 'Login (Mobile)', blurb: 'Reduced taps, clear errors, password managers play nice.' },
    { img: legacyPhoneProfile, title: 'Profile', blurb: 'Membership, billing, and preferences in one spot.' },
    { img: legacyPhoneNew, title: 'Book Class', blurb: 'Fast booking with capacity feedback.' },
    { img: legacyPhoneEdit, title: 'Edit Booking', blurb: 'Reschedule/cancel flows without rage clicks.' },
    { img: legacyPhoneInfo, title: 'Class Details', blurb: 'Coach, equipment, intensity, and rules summary.' },
    { img: phoneGraph, title: 'Finance Mini-Dashboard', blurb: 'Tiny charts optimized for small screens.' },
  ];

  const [desktopIdx, setDesktopIdx] = useState(0);
  const [phoneIdx, setPhoneIdx] = useState(0);

  // Lightbox state
  const [desktopLbOpen, setDesktopLbOpen] = useState(false);
  const [desktopLbIndex, setDesktopLbIndex] = useState(0);
  const [phoneLbOpen, setPhoneLbOpen] = useState(false);
  const [phoneLbIndex, setPhoneLbIndex] = useState(0);

  const d = desktopSlides[desktopIdx] || {};
  const m = phoneSlides[phoneIdx] || {};

  const desktopImages = desktopSlides.map(s => s.img);
  const phoneImages   = phoneSlides.map(s => s.img);

  return (
    <section id="projects" className="projects">
      <h2>My Projects</h2>

      <div className="projects-grid two-cards">
        {/* Desktop card */}
        <article className="project-card desktop">
          <div className="project-media">
            <InlineCarousel
              images={desktopImages}
              ratio="16 / 9"
              onChange={setDesktopIdx}
              onImageClick={(i) => { setDesktopLbIndex(i); setDesktopLbOpen(true); }}
            />
          </div>
          <div className="project-body">
            <h3 className="project-title">{d.title || 'Desktop Web UI'}</h3>
            <p className="project-desc">{d.blurb || 'Responsive desktop layouts and charts.'}</p>
            <div className="tags"><span className="tag">React</span><span className="tag">Vite</span><span className="tag">CSS</span></div>
          </div>
        </article>

        {/* Mobile card */}
        <article className="project-card mobile">
          <div className="project-media">
            <div className="phone-frame">
              <InlineCarousel
                images={phoneImages}
                ratio="9 / 16"
                showDots={false}
                onChange={setPhoneIdx}
                onImageClick={(i) => { setPhoneLbIndex(i); setPhoneLbOpen(true); }}
              />
            </div>
          </div>
          <div className="project-body">
            <h3 className="project-title">{m.title || 'Mobile UI'}</h3>
            <p className="project-desc">{m.blurb || 'Phone-first screens with readable type and thumb-friendly spacing.'}</p>
            <div className="tags"><span className="tag">Responsive</span><span className="tag">UX</span><span className="tag">Performance</span></div>
          </div>
        </article>
      </div>

      {/* Lightboxes */}
      {desktopLbOpen && (
        <LightboxPortal
          images={desktopImages}
          startIndex={desktopLbIndex}
          onClose={() => setDesktopLbOpen(false)}
        />
      )}
      {phoneLbOpen && (
        <LightboxPortal
          images={phoneImages}
          startIndex={phoneLbIndex}
          onClose={() => setPhoneLbOpen(false)}
        />
      )}
    </section>
  );
}
