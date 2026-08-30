import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SmartHeader from "../smart-header";
import styles from "./project.module.css";
import JsonLd from "@/src/components/seo/json-ld";
import { absoluteUrl, breadcrumbList, studioReference, websiteReference } from "@/src/lib/structured-data";
import { projectDetails } from "@/src/lib/work-projects";

export function generateStaticParams() {
  return Object.keys(projectDetails).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projectDetails[slug];
  if (!project) return {};

  return {
    title: `${project.title} | Launchset Work`,
    description: project.summary,
    alternates: { canonical: project.href },
  };
}

function ProjectVisual({ slug, image, imageAlt }: { slug: string; image?: string; imageAlt?: string }) {
  if (image) {
    return <Image src={image} alt={imageAlt ?? ""} fill priority sizes="100vw" />;
  }

  if (slug === "vietnamese-voice-translator") {
    return (
      <div className={styles.voiceVisual} aria-label="Local voice translator interface demonstration">
        <header><span>LOCAL TRANSLATION</span><b><i /> Listening</b></header>
        <div><span>LIVE INPUT / VIETNAMESE</span><strong>Vui lòng gửi cho tôi chi tiết cuộc hẹn.</strong></div>
        <div><span>ENGLISH OUTPUT</span><strong>Please send me the appointment details.</strong></div>
        <footer><span>LEVEL</span><b>-32.4 dBFS</b><span>TRIGGER</span><b>Silero VAD</b></footer>
      </div>
    );
  }

  return (
    <div className={styles.chatVisual} aria-label="Zalo bilingual translator interface demonstration">
      <header>ZALO WEB <span>Vietnamese + English</span></header>
      <div>Chào bạn, ngày mai chúng ta gặp nhau lúc mấy giờ?<span>Hello, what time are we meeting tomorrow?</span></div>
      <div>Khoảng hai giờ chiều nhé.<span>Around two in the afternoon.</span></div>
      <footer>2 messages translated on this device</footer>
    </div>
  );
}

function EvidenceIcon({ icon }: { icon: "product" | "image" | "features" | "links" }) {
  const paths = {
    product: <><path d="m4 7.5 8-4 8 4-8 4-8-4Z" /><path d="M4 7.5v9l8 4 8-4v-9M12 11.5v9" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 3.5 3.5 2.5-2.5 5 5" /></>,
    features: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3.5 6 1.3 1.3L7 5M3.5 12l1.3 1.3L7 11M3.5 18l1.3 1.3L7 17" /></>,
    links: <><rect x="3" y="9" width="6" height="6" rx="1" /><rect x="16" y="3" width="5" height="5" rx="1" /><rect x="16" y="16" width="5" height="5" rx="1" /><path d="M9 12h3.5M12.5 12V5.5H16M12.5 12v6.5H16" /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[icon]}</svg>;
}

function ChallengeIllustration() {
  return (
    <div className={styles.challengeArtwork}>
      <Image
          src="/projects/prestige-concept/prestige-data-flow-v3.svg"
        alt="Supplier data, product images and specifications becoming four validated product cards"
        width={1440}
        height={1056}
        sizes="(max-width: 800px) 92vw, 620px"
        unoptimized
      />
    </div>
  );
}

const prestigeBuildAreas = [
  {
    label: "STOREFRONT",
    title: "A complete route from browsing to buying",
    copy: "The customer-facing website turns the catalogue into a clear journey across discovery, enquiry and purchase.",
    details: [
      ["Catalogue browsing", "Category pages help customers find the right products."],
      ["Product pages", "Images, features, specifications and compatible accessories stay together."],
      ["Basket and checkout", "Customers can build an order and pay through secure Stripe checkout."],
      ["Accounts and orders", "Passwordless accounts keep payments and order history accessible."],
    ],
  },
  {
    label: "PRODUCT SYSTEM",
    title: "Product review and publishing",
    copy: "Internal tools were built to inspect, approve and publish supplier data without exposing unfinished products.",
    details: [
      ["Catalogue review", "Scraped details, images, features and linked accessories can be inspected together."],
      ["Image ordering", "Images are approved and placed in their storefront display order."],
      ["Feature review", "Extracted PDF features are compared with supplier data before import."],
      ["Publishing controls", "Publication states and database policies keep unfinished products off the live website."],
    ],
  },
  {
    label: "DATA PIPELINES",
    title: "Supplier information",
    copy: "Tooling processes large supplier catalogues while keeping questionable data out of production.",
    details: [
      ["Scraping", "Supplier pages were collected with bounded retries and resumable checkpoints."],
      ["Cleaning", "Navigation text, duplicate values and inconsistent formatting were highlighted for manual review."],
      ["Product matching", "SKUs were used to connect products with the correct categories, images and accessories."],
      ["Importing", "Approved products, images, specifications and relationships were written to the catalogue database."],
    ],
  },
  {
    label: "INFRASTRUCTURE",
    title: "Website infrastructure",
    copy: "The website and its data run on infrastructure designed for a growing business.",
    details: [
      ["Cloudflare Workers", "Runs the Next.js application as a Cloudflare Worker, with OpenNext adapting the server-side code for Cloudflare’s runtime."],
      ["D1 and R2", "Stores the structured data and images."],
      ["Stripe", "Creates secure checkout sessions and records payment status."],
      ["Transactional email", "Sends sign-in links, customer messages and enquiry notifications."],
    ],
  },
] as const;

const prestigeTechnicalChallenges = [
  {
    title: "Turning 70GB of supplier files into a usable media system",
    titleLines: ["Turning", "70GB of supplier files", "into a usable media system"],
    visual: "assets",
    problem: "More than 70GB of supplier assets arrived across inconsistent folders, formats and file sizes. The files could not be safely matched to products or served directly.",
    decision: "I built rerunnable processing jobs that converted approved images to WebP, assigned stable R2 paths and recorded each asset’s dimensions, SKU and display order.",
    result: "Prestige gained an organised media layer connected directly to its product catalogue.",
  },
  {
    title: "Turning supplier PDFs into reviewed product data",
    titleLines: ["Turning", "supplier PDFs", "into reviewed product data"],
    visual: "pdf",
    problem: "Supplier PDFs were designed for people, not software. Product features were mixed with dimensions, warranty information and repeated page content.",
    decision: "I combined deterministic PDF parsing with constrained local AI extraction. Every proposed feature passed through a review interface and AI was never allowed to publish directly.",
    result: "Approved features became structured catalogue data backed by a visible human decision and audit trail.",
  },
  {
    title: "Making Stripe reliable on Cloudflare Workers",
    titleLines: ["Making", "Stripe reliable", "on Cloudflare Workers"],
    visual: "payments",
    problem: "Stripe’s default Node transport could leave production checkout waiting indefinitely inside the Cloudflare Worker runtime.",
    decision: "I moved Stripe to its Fetch transport, added explicit timeouts and idempotency controls, and recalculated pricing on the server.",
    result: "Checkout failures now surface clearly, duplicate sessions are controlled and order history reflects confirmed payment state.",
  },
] as const;

const prestigeScreenshots = [
  {
    src: "/projects/prestige-screenshots/product-category.png",
    alt: "Prestige Kitchens and Bedrooms sink category page showing stainless steel, packs, granite and ceramic ranges",
    width: 1440,
    height: 1000,
  },
  {
    src: "/projects/prestige-screenshots/product-detail.png",
    alt: "Prestige product page for a grey granite sink with price, dimensions, features and basket controls",
    width: 1440,
    height: 1000,
  },
  {
    src: "/projects/prestige-screenshots/catalogue-administration.png",
    alt: "Sanitized catalogue administration view showing a supplier product, SKU, price, images, features and accessories",
    width: 1440,
    height: 1000,
  },
  {
    src: "/projects/prestige-screenshots/approval-workflow.png",
    alt: "Sanitized PDF feature approval workflow with extracted features, specifications and supplier document",
    width: 1440,
    height: 1000,
  },
  {
    src: "/projects/prestige-screenshots/supplier-to-structured.png",
    alt: "Sanitized side-by-side view of a supplier specification and structured product features",
    width: 1160,
    height: 1000,
  },
  {
    src: "/projects/prestige-screenshots/image-selector.png",
    alt: "Sanitized product image selector showing image types, selection order and save controls",
    width: 1440,
    height: 1000,
  },
] as const;

function TechnicalChallengeVisual({ type }: { type: "assets" | "pdf" | "payments" }) {
  if (type === "assets") {
    return (
      <div className={`${styles.challengeVisual} ${styles.assetVisual}`} role="img" aria-label="Seventy gigabytes of mixed supplier files are validated, converted and connected to organised product records">
        <div className={styles.assetEvidence}><strong>70GB+</strong><span>RAW SUPPLIER ASSETS</span></div>
        <div className={styles.assetPipeline}>
          <div className={styles.filePile}><i>JPG</i><i>PNG</i><i>TIFF</i><span>Mixed folders</span></div>
          <b aria-hidden="true">→</b>
          <div className={styles.pipelineAction}><small>PROCESS</small><strong>Validate<br />Convert</strong><span>WebP · SKU match</span></div>
          <b aria-hidden="true">→</b>
          <div className={styles.productRecords}>
            <small>R2 STORAGE</small>
            <div className={styles.r2Root}>supplier-data / caple /</div>
            <div className={styles.r2Tree}>
              <span>products-accessories-v1 /</span>
              <span>├─ products / SKU /</span>
              <span>│&nbsp;&nbsp;├─ original / image.jpg</span>
              <strong>│&nbsp;&nbsp;└─ web / image.webp</strong>
              <span>└─ accessories / SKU / web /</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div className={`${styles.challengeVisual} ${styles.pdfVisual}`} role="img" aria-label="Specifications are extracted from a supplier PDF and approved or rejected by a human reviewer">
        <div className={styles.pdfPage}>
          <small>SUPPLIER PDF · P.14</small><strong>Product specification</strong>
          <span /><span /><span className={styles.pdfHighlight}>Bowl depth: 200mm</span><span /><span className={styles.pdfHighlight}>PVD gold finish</span><span />
        </div>
        <div className={styles.extractionArrow}><span>FEATURE EXTRACTION</span><b aria-hidden="true">→</b></div>
        <div className={styles.reviewPanel}>
          <small>HUMAN REVIEW</small>
          <div><span>Bowl depth: 200mm</span><b>APPROVED</b></div>
          <div><span>PVD gold finish</span><b>APPROVED</b></div>
          <div className={styles.rejectedFeature}><span>10 year warranty</span><b>REJECTED</b></div>
          <footer><span>Reject</span><strong>Approve selected</strong></footer>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.challengeVisual} ${styles.paymentVisual}`} role="img" aria-label="A customer checkout travels through a Cloudflare Worker, Stripe, a signed webhook and into a confirmed D1 order">
      <div className={styles.paymentFlow}>
        <div><small>01</small><strong>Customer<br />checkout</strong><span>Server price</span></div><b aria-hidden="true">→</b>
        <div><small>02</small><strong>Cloudflare<br />Worker</strong><span>Timeout set</span></div><b aria-hidden="true">→</b>
        <div className={styles.activePaymentStep}><small>03</small><strong>Stripe<br />session</strong><span>Idempotent</span></div><b aria-hidden="true">→</b>
        <div><small>04</small><strong>Signed<br />webhook</strong><span>Verified</span></div><b aria-hidden="true">→</b>
        <div className={styles.confirmedPaymentStep}><small>05</small><strong>D1 order</strong><span>CONFIRMED</span></div>
      </div>
    </div>
  );
}

function ArchitectureIcon({ type }: { type: "source" | "process" | "review" | "cloud" | "storefront" }) {
  const artwork = {
    source: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 12h5M10 16h5" /></>,
    process: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
    review: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.6 2.6L16.5 9" /></>,
    cloud: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    storefront: <><path d="M5 9h14l-1 12H6L5 9Z" /><path d="M8 9V7a4 4 0 0 1 8 0v2M9 14h6" /></>,
  };

  return <svg viewBox="0 0 24 24" aria-hidden="true">{artwork[type]}</svg>;
}

function PrestigeArchitecture() {
  return (
    <div className={styles.architecture} role="group" aria-labelledby="prestige-architecture-title">
      <div className={styles.architectureHeading}>
        <span>SYSTEM ARCHITECTURE</span>
        <h3 id="prestige-architecture-title">Catalogue build pipeline</h3>
      </div>

      <div className={styles.architectureSpine}>
        <div className={styles.architectureStep}>
          <div className={styles.stepIcon}><ArchitectureIcon type="source" /></div>
          <small>01 / SOURCE</small>
          <strong>Supplier inputs</strong>
          <span>Product pages · PDFs · Images</span>
        </div>
        <div className={styles.architectureStep}>
          <div className={styles.stepIcon}><ArchitectureIcon type="process" /></div>
          <small>02 / PROCESS</small>
          <strong>Scrape and structure</strong>
          <span>Retry · Clean · Match · Canonical JSON</span>
        </div>
        <div className={`${styles.architectureStep} ${styles.reviewStep}`}>
          <div className={styles.stepIcon}><ArchitectureIcon type="review" /></div>
          <small>03 / CONTROL POINT</small>
          <strong>Human approval</strong>
          <span>Products · Features · Image order · Links</span>
        </div>
        <div className={styles.architectureStep}>
          <div className={styles.stepIcon}><ArchitectureIcon type="cloud" /></div>
          <small>04 / CLOUD CORE</small>
          <strong>D1 + R2</strong>
          <span>Catalogue · Relationships · Media</span>
        </div>
        <div className={styles.architectureStep}>
          <div className={styles.stepIcon}><ArchitectureIcon type="storefront" /></div>
          <small>05 / DELIVERY</small>
          <strong>Customer experience</strong>
          <span>Browse · Enquire · Sign in · Buy</span>
        </div>
      </div>

      <div className={styles.runtimeBranch}>
        <div className={styles.runtimePanel}>
          <div className={styles.runtimeLabel}>Simple order logic</div>
          <div className={styles.runtimeServices}>
            <div><small>ACCESS</small><strong>Better Auth</strong><span>Google + magic links</span></div>
            <div><small>PAYMENTS</small><strong>Stripe</strong><span>Checkout + signed webhook</span></div>
            <div><small>MESSAGING</small><strong>Cloudflare Email</strong><span>Sign-in + enquiries</span></div>
            <div><small>OPERATIONS</small><strong>D1 orders</strong><span>Customer + admin history</span></div>
          </div>
        </div>
      </div>

    </div>
  );
}

function TechnicalChallenges() {
  return (
    <section className={styles.technicalChallenges} aria-labelledby="technical-challenges-title">
      <div className={styles.technicalChallengesHeading}>
        <h2 id="technical-challenges-title">Some of the biggest<br />problems I had to solve.</h2>
      </div>
      <div className={styles.technicalChallengesList}>
        {prestigeTechnicalChallenges.map((challenge) => (
          <article className={styles.technicalChallenge} key={challenge.title}>
            <div className={styles.technicalChallengeStory}>
              <div className={styles.technicalChallengeTitle}>
                <h3 aria-label={challenge.title}>
                  {challenge.titleLines.map((line) => <span aria-hidden="true" key={line}>{line}</span>)}
                </h3>
              </div>
              <TechnicalChallengeVisual type={challenge.visual} />
            </div>
            <div className={styles.technicalChallengeDetails}>
              <div><small>PROBLEM</small><p>{challenge.problem}</p></div>
              <div><small>WHAT I CHANGED</small><p>{challenge.decision}</p></div>
              <div><small>RESULT</small><p>{challenge.result}</p></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PrestigeScreenshots() {
  return (
    <section className={styles.screenshotsSection} aria-labelledby="prestige-screenshots-title">
      <h2 className={styles.screenshotsTitle} id="prestige-screenshots-title">The system in use.</h2>
      <div className={styles.screenshotGrid}>
        {prestigeScreenshots.map((screenshot) => (
          <figure className={styles.screenshotFigure} key={screenshot.src}>
            <div className={styles.screenshotFrame}>
              <Image
                src={screenshot.src}
                alt={screenshot.alt}
                width={screenshot.width}
                height={screenshot.height}
                sizes="(max-width: 800px) 100vw, 50vw"
              />
            </div>
          </figure>
        ))}
      </div>
      <p className={styles.screenshotsMore}>
        If you would like to see more about each part, have a look at my{" "}
        <a href="https://www.linkedin.com/in/johnhelyar1/" target="_blank" rel="noreferrer">LinkedIn</a>
      </p>
    </section>
  );
}

function WhatIBuilt() {
  return (
    <>
      <section className={styles.builtSection} aria-labelledby="what-i-built-label">
        <div className={styles.builtIntro}>
          <span id="what-i-built-label">WHAT I BUILT</span>
        </div>
        <div className={styles.buildGrid}>
          {prestigeBuildAreas.map((area) => (
            <article key={area.label}>
              <div className={styles.buildTop}><small>{area.label}</small></div>
              <h3>{area.title}</h3>
              <p>{area.copy}</p>
              <ul>
                {area.details.map(([title, copy]) => (
                  <li key={title}><strong>{title}</strong><span>{copy}</span></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <PrestigeArchitecture />
      </section>
      <TechnicalChallenges />
      <PrestigeScreenshots />
    </>
  );
}

const prestigeTechnologies = [
  "Next.js",
  "TypeScript",
  "Cloudflare Workers",
  "OpenNext",
  "D1",
  "R2",
  "Stripe",
  "Better Auth",
] as const;

function PrestigeOutcome() {
  return (
    <article className={styles.outcome}>
      <div className={styles.outcomeDetails}>
        <div className={styles.outcomeRelationship}>
          <small>ONGOING PARTNERSHIP</small>
          <p>I have worked with Prestige from having no website to the platform they use today, and I continue to develop and support it.</p>
        </div>
        <div className={styles.outcomeTechnology}>
          <small>TECHNOLOGY</small>
          <ul>{prestigeTechnologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
        </div>
        <div className={styles.outcomeConfidentiality}>
          <small>CONFIDENTIALITY</small>
          <p>Selected technical details are shown. Client data, credentials and operational information remain private.</p>
        </div>
        <a className={styles.outcomeLink} href="https://www.prestigekitchensandbedrooms.com" target="_blank" rel="noreferrer">
          <span>View live website</span><b aria-hidden="true">↗</b>
        </a>
      </div>
    </article>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectDetails[slug];
  if (!project) notFound();

  const pageUrl = absoluteUrl(project.href);
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${project.title} | Launchset Work`,
        description: project.summary,
        isPartOf: websiteReference,
        about: { "@id": `${pageUrl}#project` },
        mainEntity: { "@id": `${pageUrl}#project` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        inLanguage: "en-GB",
      },
      breadcrumbList(`${project.href}#breadcrumb`, [
        { name: "Launchset", path: "/" },
        { name: "Our work", path: "/work" },
        { name: project.title, path: project.href },
      ]),
      {
        "@type": "CreativeWork",
        "@id": `${pageUrl}#project`,
        name: project.title,
        description: project.summary,
        url: pageUrl,
        genre: project.type,
        creator: studioReference,
        ...(project.image ? { image: absoluteUrl(project.image) } : {}),
        keywords: project.tags.join(", "),
      },
    ],
  };

  return (
    <main className={styles.page}>
      <JsonLd data={projectJsonLd} />
      <SmartHeader />

      <section className={styles.hero}>
        <Link href="/work" className={styles.back}>← Back to our work</Link>
        <div className={styles.heroGrid}>
          <span className={styles.projectType}>{project.type}</span>
          {project.slug === "prestige-kitchens" ? (
            <h1 className={styles.prestigeTitle}>
              <span>Prestige</span>
              <span>Kitchens &amp; Bedrooms</span>
            </h1>
          ) : (
            <h1>{project.title}</h1>
          )}
          <p>{project.intro}</p>
        </div>
        <ul aria-label="Project areas">
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      </section>

      <section className={`${styles.showcase} ${styles[project.theme]}`}>
        <div className={`${styles.showcaseInner} ${project.image ? styles.browserFrame : ""} ${project.slug === "prestige-kitchens" ? styles.prestigeFrame : ""}`}>
          {project.image && project.slug !== "prestige-kitchens" && (
            <div className={styles.browserBar}><i /><i /><i /></div>
          )}
          <div className={styles.visual}>
            <ProjectVisual slug={project.slug} image={project.image} imageAlt={project.imageAlt} />
          </div>
        </div>
      </section>

      {project.evidence && (
        <section className={styles.evidence} aria-label="Project figures">
          <div className={styles.evidenceGrid}>
            {project.evidence.map((item) => (
              <div key={item.label}>
                <span className={styles.evidenceLabel}>{item.label}</span>
                <div className={styles.evidenceValue}>
                  <span className={styles.evidenceIcon}><EvidenceIcon icon={item.icon} /></span>
                  <strong>{item.value}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {project.metrics && (
        <section className={styles.metrics}>
          <div className={styles.metricsIntro}>
            <span>MEASUREMENT</span>
            <p>{project.metricNote}</p>
          </div>
          <div className={styles.metricsGrid}>
            {project.metrics.map((metric) => (
              <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>
            ))}
          </div>
        </section>
      )}

      <section className={`${styles.story} ${project.slug === "prestige-kitchens" ? styles.prestigeStory : ""}`}>
        {project.sections.map((section) => (
          section.layout === "problem" ? (
            <article className={styles.problem} key={section.label}>
              <div className={styles.problemCopy}>
                <div className={styles.problemHeading}>
                  <h2>{section.title}</h2>
                </div>
                {section.items && (
                  <ul className={styles.challengeList}>
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </div>
              <ChallengeIllustration />
            </article>
          ) : section.layout === "built" ? (
            <WhatIBuilt key={section.label} />
          ) : section.layout === "outcome" ? (
            <PrestigeOutcome key={section.label} />
          ) : (
            <article key={section.label}>
              <span>{section.label}</span>
              <div>
                <h2>{section.title}</h2>
                {section.copy && <p>{section.copy}</p>}
                {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
              </div>
            </article>
          )
        ))}
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
