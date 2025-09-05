import "./About.css";

function About() {
  return (
    <section id="about" className="about">
      <div className="about-container">
        <h2>The Team Behind the Code</h2>
        <p className="about-intro">
          We’re John and James — a two-man team combining design and development to build
          websites and altomation systems that work as good as they look.
        </p>

        <div className="team-grid">
          {/* James Card */}
          <article className="team-card">
            <h3>James — Front-End &amp; Design</h3>
            <p>
              James focuses on the <strong>front-end</strong> — the design, layout, and user
              experience that make a site inviting and easy to use. He crafts clean, responsive
              interfaces so sites look modern on any device and members use the system's
              without friction.
            </p>
          </article>

          {/* John Card */}
          <article className="team-card">
            <h3>John — Back-End &amp; Systems</h3>
            <p>
              John handles the <strong>back-end</strong> — the systems and automation that keep
              everything running smoothly. From booking logic and payments to reminders and
              analytics, he builds fast, reliable functionality that saves time and keeps
              customers coming back.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default About;
