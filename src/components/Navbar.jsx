import './Navbar.css';
import logo from '../assets/logo.png';
import { useState } from 'react';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-left">
            <a href="#hero" className="logo">
            <img src={logo} alt="Logo" />
            </a>
        </div>

        
        <div className="nav-center">
            <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
            <li><a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a></li>
            <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
            </ul>
        </div>

        <div className="nav-right">
            <button
                className="menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                >
                ☰
            </button>
        </div>
      </div>   
    </nav>
  );
}

export default Navbar;
