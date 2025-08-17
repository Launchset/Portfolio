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
            <h3>Contact Info</h3>
            <p><a href="mailto:john@launchset.dev">john@launchset.dev</a></p>
            <p>Business hours: 9AM – 5PM</p>
            <p className="muted">(I usually reply within one day.)</p>
          </article>

          {/* Card 2 */}
          <article className="contact-card">
            <h3>Got a question?</h3>
            <p>
              Whether you’re ready to start a project or just want to say hello,
              feel free to reach out. I’m happy to chat about your ideas or
              specific requests — let’s see what we can build together.
            </p>
          </article>

          {/* Card 3 */}
          <article className="contact-card">
            <h3>What to include</h3>
            <ul className="bullets">
              <li>A short intro about your business</li>
              <li>What kind of website you’re looking for</li>
              <li>Any deadlines or must-haves</li>
              <li>No pressure — just info is fine</li>
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
              <input name="company" type="text" placeholder="Acme Co." />
            </label>

            <label>
              <span>Budget (optional)</span>
              <select name="budget" defaultValue="">
                <option value="" disabled>
                  Select a range
                </option>
                <option> £50 – £200 + % of revenue on new customers</option>
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
                placeholder="What are you trying to build? Any deadlines or examples?"
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
