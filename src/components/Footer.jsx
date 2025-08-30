import "./Footer.css";
import facebookLogo from "../assets/facebook.webp";
import instagramLogo from "../assets/instagram.webp";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          &copy; {new Date().getFullYear()} James Dyson & John Helyar. All rights reserved.
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
            href="https://www.instagram.com/launchset/?next=https%3A%2F%2Fwww.instagram.com%2Foauth%2Foidc%2F%3Fe_un%26app_id%3D17951132926087090%26redirect_uri%3Dhttps%253A%252F%252Fbusiness.facebook.com%252Fpage%252Finstagram%252Foidclink%252F%26scope%3Dopenid%252Clinking%26response_type%3Dcode%26state%3D%257B%2522create_business_manager%2522%253Atrue%252C%2522csrf_nonce%2522%253A%25227r2WC2I4AdiRc2gX%2522%252C%2522enable_signup_web%2522%253Atrue%252C%2522entry_point%2522%253A%2522bizweb_progressive_onboarding_home_card%2522%252C%2522f3_request_id%2522%253A%2522a2ab3685-d96f-4a6c-96e9-0255bfe385a4%2522%252C%2522from%2522%253A%2522bizweb_progressive_onboarding_home_card%2522%252C%2522link_flow_source%2522%253A%2522biz_web%2522%252C%2522page_ids%2522%253A%255B%2522786095691254200%2522%255D%252C%2522redirect_uri%2522%253A%2522https%253A%252F%252Fbusiness.facebook.com%252Fpage%252Finstagram%252Foidclink%252F%2522%252C%2522require_professional%2522%253Atrue%257D%26enable_fb_login%3Dtrue%26force_consent%3Dtrue%26logger_id%3Da2ab3685-d96f-4a6c-96e9-0255bfe385a4%26force_authentication%3D0"
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
