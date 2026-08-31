import Image from "next/image";
import Link from "next/link";
import SmartHeader from "@/src/app/work/smart-header";
import styles from "./tool-page.module.css";
import JsonLd from "@/src/components/seo/json-ld";
import { absoluteUrl, breadcrumbList, studioReference, websiteReference } from "@/src/lib/structured-data";

export type Architecture = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  accent: "green" | "red";
  flow: Array<{ title: string; label: string; copy: string; detail: string }>;
  layers: Array<{ title: string; copy: string; items: string[] }>;
  decisions: Array<{ title: string; copy: string }>;
  technologies: string[];
  applicationCategory: string;
};

export const architectures: Record<string, Architecture> = {
  "caple-scrape-review": {
    slug: "caple-scrape-review",
    eyebrow: "SUPPLIER DATA / REVIEW ARCHITECTURE",
    title: "Caple Scrape Review",
    intro: "A staged catalogue pipeline that turns supplier product pages into structured, reviewable and verified website data without publishing uncertain information automatically.",
    image: "/portfolio/catalogue-review.webp",
    imageAlt: "Caple Scrape Review product interface",
    accent: "green",
    applicationCategory: "Catalogue management and product data review",
    technologies: ["Next.js", "JavaScript", "JSON", "Sharp", "WebP", "Cloudflare R2", "Supabase"],
    flow: [
      { title: "Supplier pages", label: "SOURCE", copy: "Caple WooCommerce product and accessory pages.", detail: "Reliable selectors expose SKU, price, gallery images, features, accessories and related items." },
      { title: "Scrape + validate", label: "AUTOMATION", copy: "The scraper normalises the source into one catalogue shape.", detail: "scrapeCapleSample.mjs uses shared validation before anything moves into the later stages." },
      { title: "JSON contract", label: "BOUNDARY", copy: "caple-sample-products.json becomes the canonical snapshot.", detail: "Every later step consumes the same reviewed snapshot instead of scraping the supplier again." },
      { title: "Human review", label: "CONTROL", copy: "The Next.js review route makes errors visible.", detail: "Products, prices, images, features and product relationships can be checked together before import." },
      { title: "R2 + Supabase", label: "STORAGE", copy: "Images are converted to WebP and data is mapped relationally.", detail: "R2 holds web media; Supabase stores products, images, specifications and ordered product links." },
      { title: "Verify + render", label: "DELIVERY", copy: "Exact verification gates the production website.", detail: "The verifier checks rows and ordering; product pages then read the catalogue through Supabase RPCs." },
    ],
    layers: [
      { title: "Collection layer", copy: "Responsible only for reading and normalising supplier content.", items: ["WooCommerce HTML", "Category index", "Rate-limited requests", "Shared validation"] },
      { title: "Review boundary", copy: "Keeps automation and publication deliberately separate.", items: ["Canonical JSON", "Caple review UI", "Feature audit", "Small proof batches"] },
      { title: "Delivery layer", copy: "Moves approved assets and relationships into production-ready storage.", items: ["Sharp / WebP", "Cloudflare R2", "Supabase tables", "Catalogue RPCs"] },
    ],
    decisions: [
      { title: "Review before import", copy: "A scraper can be syntactically correct while still misunderstanding a product. The visual review surface catches those semantic errors." },
      { title: "One reusable snapshot", copy: "Image processing, importing and verification share the same JSON contract, avoiding different stages seeing different supplier data." },
      { title: "Idempotent, small batches", copy: "The pipeline can be safely rerun, but independent verification and small batches remain the safety net because the workflow is not one large transaction." },
    ],
  },
  "lead-audit-review": {
    slug: "lead-audit-review",
    eyebrow: "BUSINESS INTELLIGENCE / REVIEW ARCHITECTURE",
    title: "Lead Audit Review",
    intro: "A research pipeline that discovers suitable businesses, audits public website signals, develops evidence-backed opportunity hypotheses and keeps a person in control of every outreach decision.",
    image: "/portfolio/lead-audit-review-v2.webp",
    imageAlt: "Lead Audit Review business opportunity interface",
    accent: "red",
    applicationCategory: "Business intelligence and lead review",
    technologies: ["Python", "Next.js", "React", "Beautiful Soup", "Playwright", "Pandas", "OpenPyXL", "JSON", "CSV"],
    flow: [
      { title: "Search inputs", label: "SOURCE", copy: "Search terms and optional manually supplied company URLs.", detail: "Excluded domains, location hints and maximum-company limits keep each run intentionally scoped." },
      { title: "Discovery", label: "QUALIFY", copy: "Bing or DuckDuckGo results are qualified and deduplicated.", detail: "Optional related-company expansion can follow stockist, distributor or brand relationships from seed sites." },
      { title: "Website audit", label: "EVIDENCE", copy: "A rate-limited session samples useful public pages.", detail: "Static HTML is the default; optional Playwright rendering handles sites that block or depend on client rendering." },
      { title: "Intelligence + scoring", label: "ANALYSE", copy: "Public evidence becomes fit, opportunity and capability signals.", detail: "The pipeline assesses website weakness, data maturity, automation opportunity, contactability and likely value." },
      { title: "Run outputs", label: "BOUNDARY", copy: "Each run writes JSON, CSV and XLSX plus discovery reports.", detail: "The files are inspectable artifacts; a failed website cannot stop the rest of the run." },
      { title: "Review + action", label: "CONTROL", copy: "The Next.js workspace joins scores, evidence and the live website.", detail: "Notes, accept/reject state, drafted messages, replies and follow-ups remain reviewable before action." },
    ],
    layers: [
      { title: "Discovery layer", copy: "Builds a qualified, deduplicated set of real company websites.", items: ["Search providers", "Manual URLs", "Domain exclusions", "Related-company expansion"] },
      { title: "Audit layer", copy: "Turns public pages into structured evidence and commercial signals.", items: ["Rate limiting", "Page sampling", "Technical signals", "Opportunity scoring"] },
      { title: "Decision layer", copy: "Makes the evidence useful without allowing automatic outreach.", items: ["JSON run outputs", "Lead review UI", "Notes and status", "Outreach records"] },
    ],
    decisions: [
      { title: "Evidence before messaging", copy: "Every recommendation is tied back to observable public pages so a reviewer can challenge the conclusion before contacting anyone." },
      { title: "One bad site cannot stop a run", copy: "Audits are isolated per company. Failures are logged while successful businesses continue into the output artifacts." },
      { title: "Human-controlled outreach", copy: "Scoring prioritises attention; it does not grant permission to send. The review UI keeps drafts, notes, replies and follow-ups visible." },
    ],
  },
};

const leadTechnology = [
  {
    title: "Find and reach the right websites",
    summary: "The first group discovers businesses, checks their addresses and visits public pages without letting one slow website hold up the full run.",
    tools: [
      { name: "Python", role: "Runs the research pipeline and keeps each business isolated." },
      { name: "DuckDuckGo + Bing", role: "Provide the first set of public discovery results." },
      { name: "Requests", role: "Fetches pages with timeouts, rate limits and safe retries." },
      { name: "Playwright", role: "Optional fallback for websites that need a real browser to appear." },
    ],
  },
  {
    title: "Read pages and form evidence",
    summary: "The page code is reduced to useful content, then checked in the same consistent way for every business.",
    tools: [
      { name: "Beautiful Soup", role: "Separates useful text, links and page structure from the HTML." },
      { name: "Python rules", role: "Applies visible, repeatable checks instead of hidden AI judgement." },
      { name: "Evidence records", role: "Keep the source page and supporting words beside every finding." },
    ],
  },
  {
    title: "Preserve each research run",
    summary: "The completed audit is written into ordinary, inspectable formats before it reaches the review interface.",
    tools: [
      { name: "Pandas", role: "Shapes results into consistent rows for comparison and export." },
      { name: "OpenPyXL", role: "Creates the Excel workbook used for wider review." },
      { name: "JSON + CSV", role: "Keep a timestamped source record that can be reopened later." },
    ],
  },
  {
    title: "Review and manage the next action",
    summary: "The final group makes the research understandable to a person and records what happens after they make a decision.",
    tools: [
      { name: "Next.js + React", role: "Power the local workspace where evidence and live websites meet." },
      { name: "SMTP", role: "Sends a message only after it has been reviewed and approved." },
      { name: "IMAP", role: "Checks for replies and connects them to the original business." },
      { name: "Local JSON state", role: "Stores notes, rejections and follow-up reminders." },
    ],
  },
] as const;

function DiagramNode({ title, detail, accent = false }: { title: string; detail?: string; accent?: boolean }) {
  return (
    <article className={`${styles.diagramNode} ${accent ? styles.diagramNodeAccent : ""}`}>
      <strong>{title}</strong>
      {detail && <span>{detail}</span>}
    </article>
  );
}

function DiagramArrow() {
  return <div className={styles.diagramArrow} aria-hidden="true"><i /></div>;
}

function ExplainedNode({
  title,
  detail,
  accent = false,
  side,
  label,
  explanationTitle,
  explanation,
}: {
  title: string;
  detail?: string;
  accent?: boolean;
  side: "left" | "right";
  label: string;
  explanationTitle: string;
  explanation: string;
}) {
  return (
    <div className={styles.explainedStep}>
      <aside className={`${styles.diagramExplanation} ${side === "left" ? styles.explanationLeft : styles.explanationRight}`}>
        <span>{label}</span>
        <h3>{explanationTitle}</h3>
        <p>{explanation}</p>
      </aside>
      <DiagramNode title={title} detail={detail} accent={accent} />
    </div>
  );
}

function DiagramBranch({
  items,
  merge,
}: {
  items: ReadonlyArray<{ title: string; detail?: string }>;
  merge: string;
}) {
  return (
    <div className={styles.diagramBranch}>
      <div className={styles.branchNodes}>
        {items.map((item) => <DiagramNode key={item.title} {...item} />)}
      </div>
      <div className={styles.branchMerge}><span>{merge}</span></div>
    </div>
  );
}

export default function ToolPageContent({ architecture }: { architecture: Architecture }) {
  const portfolioHref = `/work#${architecture.slug}`;
  const pagePath = `/work/tools/${architecture.slug}`;
  const pageUrl = absoluteUrl(pagePath);
  const toolJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${architecture.title} Architecture | Launchset`,
        description: architecture.intro,
        isPartOf: websiteReference,
        about: { "@id": `${pageUrl}#software` },
        mainEntity: { "@id": `${pageUrl}#software` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        primaryImageOfPage: { "@id": `${pageUrl}#primaryimage` },
        inLanguage: "en-GB",
      },
      breadcrumbList(`${pagePath}#breadcrumb`, [
        { name: "Launchset", path: "/" },
        { name: "Our work", path: "/work" },
        { name: architecture.title, path: pagePath },
      ]),
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#software`,
        name: architecture.title,
        description: architecture.intro,
        url: pageUrl,
        image: { "@id": `${pageUrl}#primaryimage` },
        applicationCategory: architecture.applicationCategory,
        operatingSystem: "Web browser",
        browserRequirements: "Requires a modern web browser",
        creator: studioReference,
        featureList: architecture.flow.map((step) => `${step.title}: ${step.copy}`),
        keywords: architecture.technologies.join(", "),
      },
      {
        "@type": "ImageObject",
        "@id": `${pageUrl}#primaryimage`,
        url: absoluteUrl(architecture.image),
        contentUrl: absoluteUrl(architecture.image),
        caption: architecture.imageAlt,
      },
    ],
  };

  return (
    <main className={`${styles.page} ${architecture.accent === "red" ? styles.red : ""}`}>
      <JsonLd data={toolJsonLd} />
      <SmartHeader />

      <section className={styles.hero}>
        <Link href={portfolioHref} className={styles.back}>← Back to portfolio</Link>
        <div className={styles.heroGrid}>
          <div>
            <span>{architecture.eyebrow}</span>
            <h1>{architecture.title}</h1>
          </div>
          <p>{architecture.intro}</p>
        </div>
        <div className={styles.heroImage}>
          <Image src={architecture.image} alt={architecture.imageAlt} fill priority sizes="100vw" />
        </div>
      </section>

      {architecture.slug !== "lead-audit-review" && (
        <section className={styles.flowSection}>
          <div className={styles.sectionIntro}>
            <span>01 / SYSTEM FLOW</span>
            <h2>How information<br />moves through it.</h2>
            <p>The architecture separates collection, judgement and delivery so each stage can be inspected and rerun independently.</p>
          </div>
          <div className={styles.flow}>
            {architecture.flow.map((step, index) => (
              <article key={step.title}>
                <div className={styles.flowTop}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <span>{step.label}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                <small>{step.detail}</small>
                {index < architecture.flow.length - 1 && <i aria-hidden="true">→</i>}
              </article>
            ))}
          </div>
        </section>
      )}

      {architecture.slug === "lead-audit-review" && (
        <section className={styles.logicSection}>
          <div className={styles.logicIntro}>
            <div>
              <span>01 / LEAD GENERATOR</span>
              <h2>Current<br />architecture.</h2>
            </div>
            <p>
              From search terms and manually supplied URLs through crawling,
              evidence, scoring and human-reviewed outreach. The branches show
              where sources split, combine and become the next system record.
            </p>
          </div>

          <div className={styles.architectureMap}>
            <div className={styles.sourceCluster}>
              <div className={styles.sourceNodes}>
                <DiagramNode title="Search terms" detail="DuckDuckGo / Bing HTML search" />
                <DiagramNode title="Manual URL CSV" detail="Directly supplied businesses" />
              </div>
              <div className={styles.sourceJoin}><span>Discovery candidates</span></div>
            </div>

            <DiagramArrow />
            <ExplainedNode
              title="URL qualification, exclusions and domain deduplication"
              accent
              side="left"
              label="FIRST, REMOVE THE NOISE"
              explanationTitle="A search result is not yet a useful lead."
              explanation="Search engines return directories, social profiles, repeated websites and businesses outside the brief. This check removes those distractions first, because every later answer is only useful if it belongs to the right company."
            />
            <DiagramArrow />
            <ExplainedNode
              title="Lead records"
              side="right"
              label="ONE BUSINESS, ONE STORY"
              explanationTitle="Everything now has somewhere to belong."
              explanation="Once a website passes the first check, the business receives one record. Pages, findings, scores and later conversations all attach to it, so the system can build one continuous picture instead of a pile of disconnected facts."
            />
            <div className={styles.optionalStep}><span>OPTIONAL</span> Related-company expansion</div>
            <DiagramArrow />
            <ExplainedNode
              title="HTTP crawler"
              accent
              side="left"
              label="THE RESEARCH STARTS"
              explanationTitle="The record tells us who. The crawler begins to learn how they work."
              explanation="It visits the public website just as a visitor would and brings back the pages needed for the audit. If the site cannot be reached, that failure stays with this one record instead of stopping research into every other business."
            />

            <div className={styles.branchLabel}>HOMEPAGE DISCOVERY</div>
            <DiagramBranch
              items={[
                { title: "sitemap.xml" },
                { title: "robots.txt" },
                { title: "Homepage links" },
              ]}
              merge="Page classification and sampling"
            />

            <DiagramArrow />
            <ExplainedNode
              title="Targeted page fetches"
              detail="Contact · product · trade · service · careers · booking · case study · location"
              side="right"
              label="FOLLOW THE USEFUL PATHS"
              explanationTitle="The system looks where a real opportunity would show itself."
              explanation="A homepage rarely tells the whole story. Contact, booking, product, trade and careers pages reveal how customers take action and how the business operates. Reading these next makes the audit focused rather than simply large."
            />
            <DiagramArrow />
            <ExplainedNode
              title="BeautifulSoup HTML and text inspection"
              side="left"
              label="TURN PAGES INTO SOMETHING READABLE"
              explanationTitle="A webpage has to be stripped back before it can be understood consistently."
              explanation="Menus, headings, forms and written content arrive mixed together as page code. This step separates the useful words and structures, giving the next stage clean material to inspect without changing what the website actually said."
            />
            <DiagramArrow />
            <ExplainedNode
              title="Deterministic signal dictionary"
              accent
              side="right"
              label="ASK THE SAME QUESTIONS EVERY TIME"
              explanationTitle="Clean page content still needs a fair way to be judged."
              explanation="This is a shared list of clear checks: can a visitor book, is there a useful contact route, are important pages missing, and does the site show signs of repetitive work? Using the same checks for every business makes the findings explainable and comparable."
            />
            <DiagramArrow />
            <ExplainedNode
              title="Evidence records"
              detail="URL + page type + issue + snippet + severity + commercial explanation"
              side="left"
              label="KEEP THE PROOF WITH THE FINDING"
              explanationTitle="Each answer becomes evidence someone can check."
              explanation="A finding keeps the page it came from, the relevant words and an explanation of why it may matter commercially. The scoring stages can now use it, while a person can still trace any conclusion back to what was actually visible."
            />

            <DiagramBranch
              items={[
                { title: "Rule scores" },
                { title: "Business profile" },
                { title: "Company-size rules" },
              ]}
              merge="Combined commercial assessment"
            />

            <DiagramArrow />
            <ExplainedNode
              title="Recommendations and bottleneck hypotheses"
              accent
              side="left"
              label="BRING THE THREE VIEWS BACK TOGETHER"
              explanationTitle="A weakness only matters when it connects to a real business problem."
              explanation="The rule scores, the type of business and its likely size are considered together here. That turns separate findings into a practical idea about where time may be lost, where customers may drop away, and what could be improved first."
            />
            <DiagramArrow />
            <ExplainedNode
              title="Opportunity priority score"
              side="right"
              label="DECIDE WHAT DESERVES ATTENTION FIRST"
              explanationTitle="The score organises the work; it does not make the decision."
              explanation="Businesses with clearer problems, stronger evidence and a better chance of receiving value rise in the queue. The result helps a reviewer spend time wisely, but it never gives the system permission to contact anyone."
            />
            <DiagramArrow />
            <ExplainedNode
              title="AuditResult"
              detail="Flattened output row"
              side="left"
              label="MAKE ONE COMPLETE HANDOVER"
              explanationTitle="The research is gathered into a single finished result."
              explanation="Discovery details, evidence, scores and recommendations have travelled through different parts of the system. This step brings the important pieces back together so the same business can be reviewed, exported or reopened without rebuilding its story."
            />
            <DiagramArrow />
            <ExplainedNode
              title="Run outputs"
              detail="CSV + XLSX + timestamped JSON"
              side="right"
              label="LEAVE A RECORD OF THE RUN"
              explanationTitle="The result should still make sense after the automation has stopped."
              explanation="Each run writes ordinary files that can be opened, compared and kept. This creates a clear boundary between research and review: the interface reads a saved result rather than silently changing the evidence in the background."
            />
            <DiagramArrow />
            <ExplainedNode
              title="Local Next.js review UI"
              accent
              side="left"
              label="THE HUMAN CHECKPOINT"
              explanationTitle="This is where automation gives the work back to a person."
              explanation="The reviewer sees the website, the supporting evidence, the reasoning and any drafted message together. They can reject a weak lead, add context the crawler could not know, or approve the next action. Nothing is sent simply because a score was high."
            />

            <DiagramBranch
              items={[
                { title: "Notes / rejection" },
                { title: "SMTP sending" },
                { title: "IMAP reply check" },
              ]}
              merge="JSON state files"
            />

            <DiagramArrow />
            <DiagramNode title="Follow-up reminders" accent />
          </div>
        </section>
      )}

      {architecture.slug === "lead-audit-review" ? (
        <section className={styles.technologySection}>
          <div className={styles.sectionIntro}>
            <span>02 / TOOLS BEHIND THE SYSTEM</span>
            <h2><span className={styles.titleLine}>What powers</span><br /><span className={styles.titleLine}>each part.</span></h2>
            <p>Each tool has a narrow job. Together they move the work from public research to a decision a person can understand and control.</p>
          </div>
          <div className={styles.technologyGrid}>
            {leadTechnology.map((group, index) => (
              <article key={group.title}>
                <div className={styles.technologyTop}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>{index === 0 ? "DISCOVER" : index === 1 ? "UNDERSTAND" : index === 2 ? "PRESERVE" : "REVIEW"}</small>
                </div>
                <h3>{group.title}</h3>
                <p>{group.summary}</p>
                <ul>
                  {group.tools.map((tool) => (
                    <li key={tool.name}>
                      <strong>{tool.name}</strong>
                      <span>{tool.role}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.layersSection}>
          <div className={styles.sectionIntro}>
            <span>02 / RESPONSIBILITIES</span>
            <h2>Clear boundaries.<br />Smaller failure areas.</h2>
          </div>
          <div className={styles.layers}>
            {architecture.layers.map((layer, index) => (
              <article key={layer.title}>
                <span>0{index + 1}</span>
                <h3>{layer.title}</h3>
                <p>{layer.copy}</p>
                <ul>{layer.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.decisionsSection}>
        <div className={styles.sectionIntro}>
          <span>{architecture.slug === "lead-audit-review" ? "03 / WHY THESE CHOICES" : "03 / DESIGN DECISIONS"}</span>
          <h2>{architecture.slug === "lead-audit-review" ? <>Why these choices<br />matter.</> : <>Why it is built<br />this way.</>}</h2>
        </div>
        <div className={styles.decisions}>
          {architecture.decisions.map((decision, index) => (
            <article key={decision.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{decision.title}</h3>
              <p>{decision.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.next}>
        <p>MORE WORK</p>
        <h2>Back to the<br /><em>full portfolio.</em></h2>
        <Link href={portfolioHref}>View selected work <span>→</span></Link>
      </section>
    </main>
  );
}
