// Navbar.jsx
import './Navbar.css';
import logo from '../assets/logo.webp';
import { useEffect, useRef, useState } from 'react';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef(null);
  const firstLinkRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen) setTimeout(() => firstLinkRef.current?.focus(), 10);
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        closeButtonRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const links = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <>
      <nav className="navbar" aria-label="Main">
        <div className="nav-content">
          <div className="nav-left">
            <a href="#hero" className="logo" aria-label="Home">
              <img src={logo} alt="Logo" />
            </a>
          </div>

          <ul className="nav-inline" aria-label="Primary">
            {links.map(l => (
              <li key={l.id}>
                <a href={`#${l.id}`}>{l.label}</a>
              </li>
            ))}
          </ul>

          <button
            ref={closeButtonRef}
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

      <div
        className={`nav-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={drawerRef}
        id="mobile-drawer"
        className={`nav-drawer ${menuOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <button
          className="nav-toggle"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          style={{ alignSelf: 'flex-end' }}
        >
          ✕
        </button>

        <a href="#about" ref={firstLinkRef} onClick={() => setMenuOpen(false)}>About</a>
        <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
      </aside>
    </>
  );
}

export default Navbar;
