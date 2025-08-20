import './Navbar.css';
import logo from '../assets/logo.png';
import { useState } from 'react';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main">
      {/* Glassy pill */}
      <div className="nav-content">
        <div className="nav-left">
          <a href="#hero" className="logo" aria-label="Home">
            <img src={logo} alt="Logo" />
          </a>
        </div>

        <div className="nav-right">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
          >
            ☰
          </button>

          <ul id="primary-menu" className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
            <li><a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact Us</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
