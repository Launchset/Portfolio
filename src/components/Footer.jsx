import "./Footer.css";

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
                        Click here to visit our <strong>Facebook page</strong><underline>!</underline>  
                    </a>
                </p>
            </div>
        </footer>
    );
}
