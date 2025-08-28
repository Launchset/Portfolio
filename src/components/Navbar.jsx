import './Navbar.css';
import logo from '../assets/logo.png';
import { useEffect, useRef, useState } from 'react';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const firstLinkRef = useRef(null);

  // Lock body scroll when drawer is open + focus first link
  useEffect(() => {
    const b = document.body;
    if (menuOpen) {
      b.classList.add('body-lock');
      setTimeout(() => firstLinkRef.current?.focus(), 10);
    } else {
      b.classList.remove('body-lock');
    }
    return () => b.classList.remove('body-lock');
  }, [menuOpen]);

  // Close on ESC key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <nav className="navbar" role="navigation" aria-label="Main">
      {/* Top bar */}
      <div className="nav-wrapper">
        <div className="nav-content">
          <div className="nav-left">
            <a href="#hero" className="logo" aria-label="Home">
              <img src={logo} alt="Logo" />
            </a>
          </div>

          {/* ✅ Desktop inline links (with correct class) */}
          <ul className="nav-links nav-inline" role="menubar" aria-label="Primary">
            <li role="none"><a role="menuitem" href="#about">About</a></li>
            <li role="none"><a role="menuitem" href="#projects">Projects</a></li>
            <li role="none"><a role="menuitem" href="#contact">Contact Us</a></li>
          </ul>

          {/* Hamburger (mobile) */}
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`nav-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Right-side drawer */}
      <aside
        id="mobile-drawer"
        className={`nav-drawer ${menuOpen ? 'open' : ''}`}
        role="menu"
        aria-label="Mobile navigation"
      >
        <button
          className="nav-toggle"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          style={{ alignSelf: 'flex-end' }}
        >
          ✕
        </button>

        <a href="#about" role="menuitem" ref={firstLinkRef} onClick={() => setMenuOpen(false)}>About</a>
        <a href="#projects" role="menuitem" onClick={() => setMenuOpen(false)}>Projects</a>
        <a href="#contact" role="menuitem" onClick={() => setMenuOpen(false)}>Contact Us</a>
      </aside>
    </nav>
  );
}

export default Navbar;
