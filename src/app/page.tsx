import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import ScrollHero from "@/src/components/scroll-hero";
import JsonLd from "@/src/components/seo/json-ld";
import { founderId, siteUrl, studioId, websiteId } from "@/src/lib/structured-data";

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

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": studioId,
      name: "Launchset",
      url: siteUrl,
      description:
        "A digital design and automation studio creating distinctive websites, practical internal tools and useful automations that save time and create measurable value.",
      email: "launchsetfreelancer@gmail.com",
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: `${siteUrl}/icon-512.png`,
        contentUrl: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        caption: "Launchset",
      },
      image: { "@id": `${siteUrl}/#primaryimage` },
      founder: { "@id": founderId },
      sameAs: ["https://www.linkedin.com/in/johnhelyar1/"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "project enquiries",
        email: "launchsetfreelancer@gmail.com",
        url: `${siteUrl}/#contact`,
        availableLanguage: "English",
      },
      knowsAbout: [
        "Web design",
        "Web development",
        "Responsive design",
        "E-commerce",
        "Booking journeys",
        "Business process automation",
        "Internal business tools",
        "Data pipelines",
        "Analytics implementation",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        "@id": `${siteUrl}/#services`,
        name: "Digital design and automation services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": `${siteUrl}/#web-design-development`,
              name: "Web design and development",
              description: "Fast, distinctive websites designed around a clear business goal.",
              provider: { "@id": studioId },
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": `${siteUrl}/#bookings-ecommerce`,
              name: "Bookings and e-commerce",
              description: "Simple customer journeys that turn interest into real action.",
              provider: { "@id": studioId },
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": `${siteUrl}/#smart-automation`,
              name: "Smart automation",
              description: "Practical automation that removes repetitive administration and returns time to a business.",
              provider: { "@id": studioId },
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl,
      name: "Launchset",
      description: "The portfolio and service website for Launchset digital design and automation studio.",
      publisher: { "@id": studioId },
      inLanguage: "en-GB",
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: "Launchset — Websites built to move business forward",
      description: "Distinctive websites and smart automations that save time, create value and move businesses forward.",
      isPartOf: { "@id": websiteId },
      about: { "@id": studioId },
      primaryImageOfPage: { "@id": `${siteUrl}/#primaryimage` },
      inLanguage: "en-GB",
    },
    {
      "@type": "ImageObject",
      "@id": `${siteUrl}/#primaryimage`,
      url: `${siteUrl}/opengraph-image`,
      contentUrl: `${siteUrl}/opengraph-image`,
      caption: "Launchset digital design and automation studio",
    },
    {
      "@type": "Person",
      "@id": founderId,
      name: "John Helyar",
      url: `${siteUrl}/founder`,
      image: `${siteUrl}/founder-portrait.webp`,
      jobTitle: "Founder",
      worksFor: { "@id": studioId },
      sameAs: ["https://www.linkedin.com/in/johnhelyar1/"],
      knowsAbout: ["Problem solving", "Web development", "Business automation", "Digital systems"],
    },
  ],
};

export default function Home() {
  return (
    <main>
      <JsonLd data={homeJsonLd} />
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

      <section aria-labelledby="faq-heading" className={styles.faq} id="faq">
        <div className={styles.sectionLabel}>
          <span>Common questions</span>
          <span>Before we get started</span>
        </div>
        <div className={styles.faqIntro}>
          <h2 id="faq-heading">A few things<br /><em>worth knowing.</em></h2>
          <p>
            Straight answers about how we approach the work, where we can help
            and what working together looks like.
          </p>
        </div>
        <div className={styles.faqList}>
          {[
            ["01", "What can Launchset help us improve?", "We look for the digital friction costing your business time or holding back a good idea. That might be a website, an internal process or the automation connecting them."],
            ["02", "Can you work with our existing website or systems?", "Yes. We can improve what already works, connect tools that have become disconnected or rebuild only the part that is holding everything else back."],
            ["03", "How does a project begin?", "We start with a focused conversation about the result you need, what is slowing you down and where the clearest value can be created."],
            ["04", "What happens after launch?", "We make the handover clear, check that the work is doing its job and can continue supporting or improving it where that creates useful value."],
          ].map(([number, question, answer], index) => (
            <details key={number} open={index === 0}>
              <summary>
                <span className={styles.faqNumber}>{number}</span>
                <span className={styles.faqQuestion}>{question}</span>
                <span aria-hidden="true" className={styles.faqToggle} />
              </summary>
              <div className={styles.faqAnswer}>
                <p>{answer}</p>
              </div>
            </details>
          ))}
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
