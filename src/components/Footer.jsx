import "./Footer.css";
import facebookLogo from "../assets/facebook.webp";
import instagramLogo from "../assets/instagram.webp";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          &copy; {new Date().getFullYear()} John Helyar. All rights reserved.
        </p>

        <p className="social-links">
          <a
            href="https://www.facebook.com/profile.php?id=61579600903801"
            target="_blank"
            rel="noopener noreferrer"
            className="facebook-link"
            aria-label="Visit our Facebook page"
          >
            <img
              src={facebookLogo}
              alt="Facebook"
              style={{ width: "24px", height: "24px" }}
            />
          </a>

          <a
            href="https://www.instagram.com/launchset/"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-link"
            aria-label="Visit our Instagram"
            style={{ marginLeft: "3px" }}
          >
            <img
              src={instagramLogo}
              alt="Instagram"
              style={{
                width: "32px", height: "32px"
              }}
            />
          </a>
        </p>
      </div>
    </footer>
  );
}
