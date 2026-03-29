import { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const ENDPOINT = "/api/contact"; // hits Vercel serverless function

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    // honeypot
    if (data.company_website) return;

    setStatus("loading");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Thanks — I’ll reply shortly.");
        form.reset();
      } else {
        setStatus("error");
        setMessage("Something broke. Email me directly: john@launchset.dev");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Something broke. Email me directly: john@launchset.dev");
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="contact-wrap">
        <h2 className="contact-title">Contact Me to Discuss Your Website</h2>

        <div className="contact-grid">
          <article className="contact-card">
            <h3>Contact</h3>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:john@launchset.dev">john@launchset.dev</a>
            </p>
            <p>
              <strong>Business Hours:</strong> Monday to Friday, 9 AM to 5 PM GMT
            </p>
            <p className="muted">
              <strong>Response Time:</strong> Usually within 24 hours
            </p>
          </article>

          <article className="contact-card">
            <h3>Got a question?</h3>
            <p>
              Got a question about websites or automation for your business? Drop
              me a message and let’s see how we can put the right system in place.
            </p>
          </article>

          <article className="contact-card">
            <h3>What to include</h3>
            <ul className="bullets">
              <li>A short intro about your business</li>
              <li>The type of website you’re looking for</li>
              <li>Any must-haves or goals</li>
              <li>Your timeline or deadlines</li>
            </ul>
          </article>
        </div>

        {/* FORM */}
        <form className="contact-form card" onSubmit={handleSubmit}>
          <h3>Project Inquiry</h3>

          {/* Honeypot */}
          <input
            type="text"
            name="company_website"
            autoComplete="off"
            tabIndex="-1"
            className="hp"
            aria-hidden="true"
          />

          <div className="form-grid">
            <label>
              <span>Name</span>
              <input name="name" type="text" required placeholder="Jane Doe" />
            </label>

            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
              />
            </label>

            <label>
              <span>Company (optional)</span>
              <input name="business" type="text" placeholder="Arc Co." />
            </label>

            <label>
              <span>Budget (optional)</span>
              <select name="budget" defaultValue="">
                <option value="" disabled>
                  Select a range
                </option>
                <option>£50 – £200</option>
                <option>£200 – £500</option>
                <option>£500 – £1,000</option>
                <option>£1,000+</option>
              </select>
            </label>

            <label className="full">
              <span>Project details</span>
              <textarea
                name="message"
                required
                rows="6"
                placeholder="What kind of website are you looking for? Must-haves, deadlines, or inspiration?"
              />
            </label>

            <div className="consent-row">
              <label htmlFor="consent">
                I agree to be contacted about this inquiry.
              </label>
              <input id="consent" type="checkbox" name="consent" required />
            </div>
          </div>

          <div className="actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending…" : "Get in Touch"}
            </button>
            {(status === "success" || status === "error") && (
              <span
                className={`note ${status}`}
                role="status"
                aria-live="polite"
              >
                {status === "error" ? (
                  <>
                    Something broke. Email me directly:{" "}
                    <a href="mailto:john@launchset.dev">john@launchset.dev</a>
                  </>
                ) : (
                  message
                )}
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
