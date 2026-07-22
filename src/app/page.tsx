import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import ScrollHero from "@/src/components/scroll-hero";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const projects = [
  {
    number: "01",
    type: "CONSTRUCTION / E-COMMERCE",
    title: "Prestige Kitchens",
    result: "A faster buying journey for a growing interiors business.",
    image: "/projects/prestige-kitchens.webp",
    imagePosition: "center top",
    className: styles.projectWarm,
  },
  {
    number: "02",
    type: "MEDICAL TRAVEL / SUPPORT",
    title: "Vietmed Travel",
    result: "A clearer, more reassuring journey for international patients.",
    image: "/projects/vietmed-travel.webp",
    imagePosition: "center top",
    className: styles.projectViolet,
  },
];

export default function Home() {
  return (
    <main>
      <ScrollHero />

      <section className={styles.work} id="work">
        <div className={styles.sectionLabel}>
          <span>Our work</span>
          <span>2025 — 2026</span>
        </div>
        <div className={styles.workHeading}>
          <h2>Good design gets noticed.<br />Useful design gets results.</h2>
          <p>
            We combine sharp creative direction with practical systems that
            make running your business easier.
          </p>
        </div>
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <article className={styles.project} key={project.title}>
              <div className={`${styles.projectVisual} ${project.className}`}>
                <span className={styles.projectNumber}>{project.number}</span>
                <div className={styles.projectBrowser}>
                  <div className={styles.projectBar}><i /><i /><i /></div>
                  <div className={styles.projectScreen}>
                    <Image
                      className={styles.projectScreenshot}
                      src={project.image}
                      alt={`${project.title} website homepage`}
                      fill
                      sizes="(max-width: 760px) 72vw, 38vw"
                      style={{ objectPosition: project.imagePosition }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.projectMeta}>
                <div>
                  <span>{project.type}</span>
                  <h3>{project.title}</h3>
                </div>
                <p>{project.result}</p>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.moreWork}>
          <p>Want to see how the work came together?</p>
          <Link href="/work">See more work <span>→</span></Link>
        </div>
      </section>

      <section className={styles.services} id="services">
        <div className={styles.sectionLabel}>
          <span>What we do</span>
          <span>Built around your business</span>
        </div>
        <div className={styles.serviceIntro}>
          <h2>Everything you need.<br /><em>Nothing you don&apos;t.</em></h2>
        </div>
        <div className={styles.serviceList}>
          {[
            ["01", "Web design & development", "Fast, distinctive websites designed around a clear business goal."],
            ["02", "Bookings & e-commerce", "Simple customer journeys that turn interest into real action."],
            ["03", "Smart automation", "Remove repetitive admin and give yourself time back every week."],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <b aria-hidden="true">↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.process} id="process">
        <span className={styles.kicker}>A FOCUSED DIGITAL STUDIO</span>
        <h2>Clear thinking.<br />Useful systems.<br /><span>Measurable value.</span></h2>
        <div className={styles.processBottom}>
          <p>
            We stay close to the work, find the bottleneck and build what will
            make the clearest difference—less repetition, faster decisions and
            more time for the work that matters.
          </p>
          <Link href="/founder">Meet the founder <span>→</span></Link>
        </div>
      </section>

      <section className={styles.contact} id="contact">
        <p>HAVE A PROJECT IN MIND?</p>
        <h2>Let&apos;s make something<br /><em>worth noticing.</em></h2>
        <div className={styles.contactLinks}>
          <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com <span>↗</span></a>
          <a href="https://www.linkedin.com/in/johnhelyar1/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
