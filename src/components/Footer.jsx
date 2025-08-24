import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} James Dyson & John Helyar. All rights reserved.</p>
            </div>
        </footer>

    );
}
