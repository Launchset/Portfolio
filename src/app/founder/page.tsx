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
    "Meet the founder of Launchset and discover how a different way of thinking shapes practical, time-saving solutions.",
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
      description: "Meet John Helyar, the founder of Launchset, and the problem-solving perspective behind the studio.",
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
      description: "Founder of Launchset, applying a dyslexic problem-solving perspective to websites, automation and practical business systems.",
      worksFor: studioReference,
      sameAs: ["https://www.linkedin.com/in/johnhelyar1/"],
      knowsAbout: [
        "Problem solving",
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
            <p className={styles.eyebrow}>A DIFFERENT WAY OF THINKING</p>
            <h1>Dyslexia taught me to look for a <em>better way.</em></h1>

            <div className={styles.copy}>
              <p>
                Dyslexia has meant that succeeding—especially with English—has
                often taken more effort. It taught me to break problems down,
                look at them from different angles and keep searching until I
                find the clearest way through.
              </p>
              <p>
                That habit now shapes the way I build for businesses. I notice
                friction, question processes that take longer than they should
                and look for the fastest useful solution—not just the most
                obvious one.
              </p>
              <p>
                What once made some things harder has become something I bring
                to every project: persistence, a different perspective and a
                drive to create systems that save time and make work easier.
              </p>
            </div>

            <blockquote>
              Tools change. The way you see a problem is the value.
            </blockquote>
          </div>

          <div className={styles.storyBottom}>
            <p>SPOT THE PROBLEM · REMOVE THE FRICTION · RETURN THE TIME</p>
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
