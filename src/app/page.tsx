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
    result: "An e-commerce site for a growing interior business.",
    image: "/projects/prestige-kitchens-ferndown-hq.webp",
    imagePosition: "center center",
    imageFit: "cover",
    showBrowserBar: false,
    className: styles.projectWarm,
  },
  {
    number: "02",
    type: "MEDICAL TRAVEL / SUPPORT",
    title: "Vietmed Travel",
    result: "A clearer trustworthy built site for a more reassuring journey for international patients.",
    image: "/projects/vietmed-travel.webp",
    imagePosition: "center top",
    imageFit: "cover",
    showBrowserBar: true,
    className: styles.projectViolet,
  },
] as const;

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": studioId,
      name: "Launchset",
      url: siteUrl,
      description:
        "An automation studio creating websites, internal tools and automations that save time and reduce costs.",
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
        "Internal business tools",
        "Data pipelines",
        "Analytics implementation",
        "ERP integration",
        "Website hosting and maintenance",
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
              description: "Websites designed around trust and a clear business goal.",
              provider: { "@id": studioId },
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": `${siteUrl}/#bookings-ecommerce`,
              name: "Bookings and e-commerce",
              description: "Simple customer journeys that turn trust into customer action.",
              provider: { "@id": studioId },
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": `${siteUrl}/#smart-automation`,
              name: "Smart automation",
              description: "Automation that removes repetitive administration and returns time to a business.",
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
      description: "The portfolio and service website for Launchset developing smart digital solutions.",
      publisher: { "@id": studioId },
      inLanguage: "en-GB",
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: "Launchset — Software agency to save time, money and help with complex business problems",
      description: "Websites and smart automations that save time, create value and help with complex business problems.",
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
      caption: "Launchset software agency",
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
          <h2>Software that<br />helps a business grow.</h2>
          <p>
            We focus on building practical websites and software that improve how a business operates.
          </p>
        </div>
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <article className={styles.project} key={project.title}>
              <div className={`${styles.projectVisual} ${project.className}`}>
                <span className={styles.projectNumber}>{project.number}</span>
                <div className={`${styles.projectBrowser} ${!project.showBrowserBar ? styles.projectBrowserImage : ""}`}>
                  {project.showBrowserBar && <div className={styles.projectBar}><i /><i /><i /></div>}
                  <div className={styles.projectScreen}>
                    <Image
                      className={styles.projectScreenshot}
                      src={project.image}
                      alt={`${project.title} website homepage`}
                      fill
                      quality={project.number === "01" ? 100 : 75}
                      sizes="(max-width: 760px) 72vw, 38vw"
                      style={{ objectFit: project.imageFit, objectPosition: project.imagePosition }}
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
        </div>
        <div className={styles.serviceIntro}>
          <h2>Focusing on your problem.<br /><em>To help your business run smoother.</em></h2>
        </div>
        <div className={styles.serviceList}>
          {[
            ["01", "Web design & development", "Focusing on trust-led information, clear pictures and an intuitive user experience to help your business stand out."],
            ["02", "E-commerce", "Using data pipelines to speed up product integrations. While focusing on email automation and dashboards to handle customer enquiries and orders. As well as using other technologies to reduce the amount of manual work your business has to do."],
            ["03", "Smart automation", "Building tools that make it easier to manage your business. From adding in processes that allow you to change the price whenever you would like, to accounting and ERP integrations that focus on reducing errors that your business makes."],
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
        <h2>About us.</h2>
        <div className={styles.processBottom}>
          <div className={styles.processCopy}>
            <p className={styles.processLead}>Launchset was built because we enjoy solving problems and creating the best possible outcome, rather than settling for something that just works. We take the time to understand the fundamentals and build something clean from there. While we do that, we keep you involved and build software that works now and scales into the future.</p>
          </div>
          <Link href="/founder">Meet the founder <span>→</span></Link>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className={styles.faq} id="faq">
        <div className={styles.faqIntro}>
          <h2 id="faq-heading">FAQ</h2>
        </div>
        <div className={styles.faqList}>
          {[
            ["01", "What can Launchset help us improve?", "We look for the digital friction costing your business trust, time or money. That might be how part of a website functions, a system that could be put in place to help with efficiency, or a process that you already pay for that you shouldn't have to."],
            ["02", "Can you work with our existing website or systems?", "Yes. We can work with your existing systems, from developing new plugins for WordPress to working with your legacy systems as well as migrating old infrastructure onto something more robust."],
            ["03", "How does a project begin?", "We start by getting to know your current system or if you don't have one your current goals that then gives us a better understanding of the type of work that we will need to do to achieve your goals."],
            ["04", "What happens after launch?", "We either hand over the project or continue supporting your infrastructure and helping you along your business journey and developing your ideas."],
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
        <h2>Let&apos;s work together<br /></h2>
        <div className={styles.contactLinks}>
          <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com <span>↗</span></a>
          <a href="https://www.linkedin.com/in/johnhelyar1/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
