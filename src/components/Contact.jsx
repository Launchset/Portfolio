import { useState } from "react";
import "./Contact.css";

export default function Contact() {
  const [status, setStatus] = useState("idle");

  // change this to your form endpoint (Formspree, EmailJS API route, etc.)
  const ENDPOINT = "https://formspree.io/f/your-id";

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // honeypot
    if (data.get("company_website")) return;

    setStatus("loading");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="contact-wrap">
        <h2 className="contact-title">Contact Me to Discuss Your Website</h2>

        <div className="contact-grid">
          {/* Card 1 */}
          <article className="contact-card">
            <h3>Contact</h3>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:john@launchset.dev">john@launchset.dev</a>
            </p>
            <p>
              <strong>Business Hours:</strong> Hours may vary, but I typically work Monday to Friday, 9 AM to 5 PM GMT.
            </p>
            <p className="muted">
              <strong>Response Time:</strong> I typically reply within 24 hours.
            </p>
          </article>

          {/* Card 2 */}
          <article className="contact-card">
            <h3>Got a question?</h3>
            <p>
              Got a question about websites or booking systems for your boxing gym?
              I specialize in creating solutions that attract members and simplify
              class management. Drop me a message and let’s see how we can put the
              right system in place.
            </p>
          </article>

          {/* Card 3 */}
          <article className="contact-card">
            <h3>What to include</h3>
            <ul className="bullets">
              <li>➤ A brief intro about your gym/business — who you are and what you do.</li>
              <li>➤ The type of website you’re looking for (new site, redesign, booking, membership features).</li>
              <li>➤ Any must‑haves or goals (class booking, payments, specific style/brand feel).</li>
              <li>➤ Timeline or deadlines (if you have a launch date in mind).</li>
            </ul>
          </article>
        </div>

        {/* FORM CARD */}
        <form
          className="contact-form card"
          onSubmit={handleSubmit}
          action={ENDPOINT}
          method="POST"
        >
          <h3>Project Inquiry</h3>

          {/* Honeypot for bots */}
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
              <input name="company" type="text" placeholder="Arc Co." />
            </label>

            <label>
              <span>Budget (optional)</span>
              <select name="budget" defaultValue="">
                <option value="" disabled>
                  Select a range
                </option>
                <option> £50 – £200</option>
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
                placeholder="What kind of website are you looking for? Include must-haves, deadlines, or example sites you like."
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
            {status === "success" && (
              <span className="note success">Thanks — I’ll reply shortly.</span>
            )}
            {status === "error" && (
              <span className="note error">
                Something broke. Email me directly:{" "}
                <a href="mailto:john@launchset.dev">john@launchset.dev</a>
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
