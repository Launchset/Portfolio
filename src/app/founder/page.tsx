import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SmartHeader from "../work/smart-header";
import styles from "./founder.module.css";
import JsonLd from "@/src/components/seo/json-ld";
import { absoluteUrl, breadcrumbList, founderId, studioReference, websiteReference } from "@/src/lib/structured-data";

export const metadata: Metadata = {
  title: "Founder | Launchset",
  description:
    "Meet John Helyar, the finance-literate software developer and systems architect behind Launchset.",
  alternates: { canonical: "/founder" },
};

const founderJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": absoluteUrl("/founder#webpage"),
      url: absoluteUrl("/founder"),
      name: "Founder | Launchset",
      description: "Meet John Helyar, the founder of Launchset, and learn how he approaches complex business software and systems architecture.",
      isPartOf: websiteReference,
      mainEntity: { "@id": founderId },
      breadcrumb: { "@id": absoluteUrl("/founder#breadcrumb") },
      inLanguage: "en-GB",
    },
    breadcrumbList("/founder#breadcrumb", [
      { name: "Launchset", path: "/" },
      { name: "Founder", path: "/founder" },
    ]),
    {
      "@type": "Person",
      "@id": founderId,
      name: "John Helyar",
      url: absoluteUrl("/founder"),
      image: {
        "@type": "ImageObject",
        url: absoluteUrl("/founder-portrait.webp"),
        contentUrl: absoluteUrl("/founder-portrait.webp"),
        caption: "John Helyar, founder of Launchset",
      },
      jobTitle: "Founder",
      description: "Founder of Launchset, Accounting and Finance graduate, and self-taught software developer and systems architect focused on complex business systems.",
      worksFor: studioReference,
      sameAs: ["https://www.linkedin.com/in/johnhelyar1/"],
      knowsAbout: [
        "Problem solving",
        "Accounting and finance",
        "ERP architecture",
        "AI-assisted accounting",
        "Software systems architecture",
        "Web design and development",
        "Business automation",
        "Internal tools",
        "Digital systems",
      ],
    },
  ],
};

export default function FounderPage() {
  return (
    <main className={styles.page}>
      <JsonLd data={founderJsonLd} />
      <SmartHeader />

      <section className={styles.founder}>
        <div className={styles.portrait}>
          <Image
            src="/founder-portrait.webp"
            alt="Portrait of the Launchset founder"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 46vw"
          />
          <span>FOUNDER / LAUNCHSET</span>
        </div>

        <div className={styles.story}>
          <div className={styles.storyBody}>
            <p className={styles.eyebrow}>FOUNDER / JOHN HELYAR</p>
            <h1 className={styles.visuallyHidden}>John Helyar, founder of Launchset</h1>

            <div className={styles.copy}>
              <p>
                I&apos;m John Helyar, the founder of Launchset and a self-taught
                software developer and systems architect. I enjoy difficult
                problems where software, operations, money and people overlap.
              </p>
              <p>
                That interest has led my current work towards complex ERP
                architecture and exploring new ways accounting can work with
                software and AI. Before moving in this direction, I built
                experience across web development, e-commerce, automation, data
                processing, cloud infrastructure and wider systems architecture.
                I enjoy understanding how information moves through a business
                and designing systems that make operations more efficient,
                reliable and controlled.
              </p>
              <p>
                I&apos;m an Accounting and Finance graduate and highly financially
                literate. My degree improved how I think about costs, risks,
                controls and auditability in both software and business
                operations. It helps me approach software as a critical part of
                the wider business rather than an isolated product.
              </p>
              <p>
                Connecting with people and businesses in person is an important
                part of how I like to work. I believe it builds trust,
                demonstrates responsibility for the work I produce and creates
                closer business relationships. That direct communication can
                move projects forward faster and help ensure the work is seen
                through to the end.
              </p>
              <p>
                Dyslexia has also influenced how I approach my work. It taught
                me to break complicated problems into understandable parts,
                examine them from angles others might miss and place a strong
                focus on optimisation and efficiency.
              </p>
            </div>
          </div>

          <div className={styles.storyBottom}>
            <p>UNDERSTAND THE BUSINESS · DESIGN THE SYSTEM · SEE IT THROUGH</p>
            <div>
              <Link href="/work">Our work <span>→</span></Link>
              <a className={styles.primaryLink} href="mailto:launchsetfreelancer@gmail.com">Email <span>↗</span></a>
              <a href="https://www.linkedin.com/in/johnhelyar1/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
