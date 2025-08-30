// Navbar.jsx
import './Navbar.css';
import logo from '../assets/logo.webp';
import { useEffect, useRef, useState } from 'react';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const firstLinkRef = useRef(null);

  // lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen) setTimeout(() => firstLinkRef.current?.focus(), 10);
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const links = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <>
      {/* Top bar only */}
      <nav className="navbar" role="navigation" aria-label="Main">
        <div className="nav-content">
          <div className="nav-left">
            <a href="#hero" className="logo" aria-label="Home">
              <img src={logo} alt="Logo" />
            </a>
          </div>

          <ul className="nav-inline" role="menubar" aria-label="Primary">
            {links.map(l => (
              <li role="none" key={l.id}>
                <a role="menuitem" href={`#${l.id}`}>{l.label}</a>
              </li>
            ))}
          </ul>

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
      </nav>

      {/* Backdrop + Drawer OUTSIDE the nav */}
      <div
        className={`nav-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

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
    </>
  );
}

export default Navbar;
