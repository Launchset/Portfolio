import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                <h3>Launchset</h3>
                <p>Websites for small businesses that save time.</p>
                </div>
                <div className="footer-links">
                <a href="#about">About</a>
                <a href="#projects">Projects</a>
                <a href="#contact">Contact</a>
                </div>
                <div className="footer-contact">
                <p>Email: john@launchset.dev</p>
                <p>© 2025 Launchset. All rights reserved.</p>
                </div>
            </div>
        </footer>

    );
}

export default Footer;