import "./About.css";

function About() {
  return (
    <section id="about" className="about">
      <div className="about-container">
        <h2>The Team Behind the Code</h2>
        <p className="about-intro">
          John builds websites and automation systems that work as good as they look.
        </p>

        <div className="team-grid">
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
