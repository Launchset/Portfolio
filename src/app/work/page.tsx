import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./work.module.css";
import SmartHeader from "./smart-header";
import JsonLd from "@/src/components/seo/json-ld";
import { absoluteUrl, breadcrumbList, studioReference, websiteReference } from "@/src/lib/structured-data";
import { workProjects } from "@/src/features/work/projects";

export const metadata: Metadata = {
  title: "Our Work | Launchset",
  description: "Websites, automations and practical digital tools by Launchset.",
  alternates: { canonical: "/work" },
};

const workJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": absoluteUrl("/work#webpage"),
      url: absoluteUrl("/work"),
      name: "Our Work | Launchset",
      description: "Websites, automations and practical digital tools by Launchset.",
      isPartOf: websiteReference,
      about: studioReference,
      breadcrumb: { "@id": absoluteUrl("/work#breadcrumb") },
      mainEntity: { "@id": absoluteUrl("/work#portfolio") },
      inLanguage: "en-GB",
    },
    breadcrumbList("/work#breadcrumb", [
      { name: "Launchset", path: "/" },
      { name: "Our work", path: "/work" },
    ]),
    {
      "@type": "ItemList",
      "@id": absoluteUrl("/work#portfolio"),
      name: "Launchset portfolio",
      numberOfItems: workProjects.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: workProjects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          "@id": `${absoluteUrl(project.href)}#project`,
          name: project.title,
          description: project.summary,
          url: absoluteUrl(project.href),
          ...(project.image ? { image: absoluteUrl(project.image) } : {}),
          genre: project.type,
          creator: studioReference,
        },
      })),
    },
  ],
};

function ProjectPreview({ project }: { project: (typeof workProjects)[number] }) {
  if (project.image) {
    return (
      <Image
        src={project.image}
        alt={project.imageAlt ?? ""}
        fill
        quality={project.slug === "prestige-kitchens" ? 100 : 75}
        sizes="(max-width: 760px) 92vw, 44vw"
        className={styles.cardImage}
      />
    );
  }

  if (project.slug === "vietnamese-voice-translator") {
    return (
      <div className={styles.voicePreview} aria-hidden="true">
        <div><span>MICROPHONE</span><b><i /> Listening</b></div>
        <div><span>VIETNAMESE INPUT</span><strong>Vui lòng gửi cho tôi chi tiết cuộc hẹn.</strong></div>
        <div><span>ENGLISH OUTPUT</span><strong>Please send me the appointment details.</strong></div>
      </div>
    );
  }

  return (
    <div className={styles.chatPreview} aria-hidden="true">
      <div>Chào bạn, ngày mai chúng ta gặp nhau lúc mấy giờ?<span>Hello, what time are we meeting tomorrow?</span></div>
      <div>Khoảng hai giờ chiều nhé.<span>Around two in the afternoon.</span></div>
    </div>
  );
}

export default function WorkPage() {
  return (
    <main className={styles.page}>
      <JsonLd data={workJsonLd} />
      <SmartHeader />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>Our <em>work.</em></h1>
          <p>
            Websites, internal tools and practical systems shaped to solve a
            problem. Select a project to see the thinking and work behind it.
          </p>
        </div>
      </section>

      <section className={styles.projectSection} aria-labelledby="selected-projects-title">
        <div className={styles.sectionHeading}>
          <h2 id="selected-projects-title">Projects</h2>
        </div>

        <div className={styles.projectGrid}>
          {workProjects.map((project, index) => (
            <article id={project.slug} className={styles.projectCard} key={project.slug}>
              <Link href={project.href} aria-label={`View ${project.title}`}>
                <div className={`${styles.cardMedia} ${styles[project.theme]}`}>
                  <ProjectPreview project={project} />
                  <span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.cardAction}>View project <b>↗</b></span>
                </div>
                <div className={styles.cardCopy}>
                  <span>{project.type}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <ul aria-label="Project areas">
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.nextProject}>
        <p>Have something in mind?</p>
        <h2>Let&apos;s make your project<br /><em>the next one.</em></h2>
        <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com <span>↗</span></a>
      </section>
    </main>
  );
}
