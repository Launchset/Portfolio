import "./Footer.css";
import facebookLogo from "../assets/faceboook.png"; // adjust path if Footer.jsx is deeper in folders

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>
                    &copy; {new Date().getFullYear()} James Dyson & John Helyar. All rights reserved.
                </p>
                <p>
                    <a 
                        href="https://www.facebook.com/profile.php?id=61579600903801" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="facebook-link"
                    >
                        <img 
                            src={facebookLogo} 
                            alt="Facebook" 
                            style={{ width: "24px", height: "24px" }} 
                        />
                    </a>
                </p>
            </div>
        </footer>
    );
}
