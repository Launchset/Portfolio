import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./work.module.css";
import SmartHeader from "./smart-header";

export const metadata: Metadata = {
  title: "Our Work | Launchset",
  description: "Websites, automations and practical digital tools by Launchset.",
  alternates: { canonical: "/work" },
};

const projects = [
  {
    type: "CONSTRUCTION / E-COMMERCE",
    title: "Prestige Kitchens",
    image: "/projects/prestige-kitchens.webp",
    summary:
      "A premium, catalogue-led website that helps customers move from inspiration to the right kitchen, bedroom or product without getting lost.",
    challenge:
      "Prestige serves customers planning complete fitted spaces as well as people shopping for individual appliances, sinks and taps. The website needed to make both journeys feel clear while retaining the considered feel of the brand.",
    contribution: [
      "Creative direction and responsive interface design",
      "Category, product and enquiry journey planning",
      "Design consultation and conversion-focused touchpoints",
      "Performance-minded image and front-end implementation",
    ],
    result:
      "A clearer digital shopfront designed to support considered interior projects and direct product discovery in one cohesive experience.",
    theme: "warm",
  },
  {
    type: "MEDICAL TRAVEL / SUPPORT",
    title: "Vietmed Travel",
    image: "/projects/vietmed-travel.webp",
    summary:
      "A calm, reassuring landing experience for international patients considering medical care in Vietnam.",
    challenge:
      "Medical travel can feel complicated and unfamiliar. The experience needed to explain the journey simply, establish trust early and make the support available before, during and after treatment feel tangible.",
    contribution: [
      "Brand-led responsive website design",
      "Clear content hierarchy for a sensitive service",
      "Health Buddy, clinic and guided-journey storytelling",
      "Accessible calls to action and mobile implementation",
    ],
    result:
      "A focused entry point that turns a complex service into a guided, human journey with clear next steps.",
    theme: "aqua",
  },
] as const;

export default function WorkPage() {
  return (
    <main className={styles.page}>
      <SmartHeader />

      <section className={styles.hero}>
        <div className={styles.heroLabel}>
          <span>Our work</span>
          <span>2025 — 2026</span>
        </div>
        <div className={styles.heroCopy}>
          <h1>A closer look at<br /><em>the work.</em></h1>
          <p>
            Websites, internal tools and useful automations built around real
            business goals—from the first idea through to measurable results.
          </p>
        </div>
        <span className={styles.scrollNote}>WEBSITES / SYSTEMS / MEASUREMENT</span>
      </section>

      <section className={styles.projects}>
        {projects.map((project) => (
          <article className={styles.caseStudy} key={project.title}>
            <div className={`${styles.projectHeading} ${styles.projectHeadingNoIndex}`}>
              <div>
                <p>{project.type}</p>
                <h2>{project.title}</h2>
              </div>
              <p>{project.summary}</p>
            </div>

            <div className={`${styles.projectImage} ${styles[project.theme]}`}>
              <div className={styles.browser}>
                <div className={styles.browserBar}><i /><i /><i /></div>
                <div className={styles.browserScreen}>
                  <Image
                    src={project.image}
                    alt={`${project.title} website homepage`}
                    fill
                    sizes="(max-width: 800px) 92vw, 82vw"
                    className={styles.screenshot}
                  />
                </div>
              </div>
            </div>

            <div className={styles.projectDetails}>
              <section>
                <span>THE CHALLENGE</span>
                <p>{project.challenge}</p>
              </section>
              <section>
                <span>OUR CONTRIBUTION</span>
                <ul>
                  {project.contribution.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
              <section>
                <span>THE RESULT</span>
                <p>{project.result}</p>
              </section>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.systems}>
        <div className={styles.systemsHeading}>
          <div>
            <span>BEYOND THE WEBSITE</span>
            <h2>Tools that do<br /><em>the useful work.</em></h2>
          </div>
          <p>
            We also build the systems behind the screen: data pipelines,
            review tools, reporting access and local AI utilities that remove
            repetitive work while keeping people in control.
          </p>
        </div>

        <div className={styles.toolGrid}>
          <article id="caple-scrape-review" className={`${styles.toolCard} ${styles.toolWide}`}>
            <div className={styles.toolImage}>
              <Image src="/portfolio/catalogue-review.webp" alt="Supplier catalogue review interface showing scraped product data" fill sizes="(max-width: 800px) 92vw, 58vw" />
            </div>
            <div className={styles.toolCopy}>
              <span>CAPLE / SUPPLIER DATA REVIEW</span>
              <h3>Caple Scrape Review</h3>
              <p>A dedicated review surface for scraped Caple products. It brings the product, SKU, price, images, features, accessories and related-product links together so the data can be checked before it reaches the live catalogue.</p>
              <small>SCRAPING · PRODUCT RELATIONSHIPS · R2 · SUPABASE</small>
              <Link className={styles.architectureLink} href="/work/tools/caple-scrape-review">Explore architecture <span>→</span></Link>
            </div>
          </article>

          <article id="lead-audit-review" className={`${styles.toolCard} ${styles.toolWide}`}>
            <div className={styles.toolImage}>
              <Image src="/portfolio/lead-audit-review-v2.webp" alt="Lead Audit Review interface showing business scores, evidence and website review" fill sizes="(max-width: 800px) 92vw, 82vw" />
            </div>
            <div className={styles.toolCopy}>
              <span>BUSINESS INTELLIGENCE / OPPORTUNITY REVIEW</span>
              <h3>Lead Audit Review</h3>
              <p>A research and review workspace that discovers businesses, scores fit and opportunity, surfaces evidence from their websites and turns the findings into a clear software bottleneck hypothesis and practical conversation starter.</p>
              <small>DISCOVERY · SCORING · PUBLIC EVIDENCE · OUTREACH REVIEW</small>
              <Link className={styles.architectureLink} href="/work/tools/lead-audit-review">Explore architecture <span>→</span></Link>
            </div>
          </article>

          <article className={`${styles.toolCard} ${styles.toolDark}`}>
            <div className={styles.voiceDemo} aria-label="Local voice translator interface demonstration">
              <div><span>MIC</span><b><i /> Listening</b></div>
              <div><span>LEVEL</span><b>-32.4 dBFS</b></div>
              <div><span>TRIGGER</span><b>Silero VAD</b></div>
              <section><span>LIVE INPUT</span><i /></section>
              <p><small>ENGLISH OUTPUT</small>Please send me the appointment details.</p>
            </div>
            <div className={styles.toolCopy}>
              <span>LOCAL AI / ACCESSIBILITY</span>
              <h3>Vietnamese voice translator</h3>
              <p>A microphone tool that detects Vietnamese speech, transcribes it and translates it into English entirely on the local machine.</p>
              <small>WHISPER · SILERO VAD · OPUS-MT</small>
            </div>
          </article>

          <article className={`${styles.toolCard} ${styles.toolBlue}`}>
            <div className={styles.chatDemo} aria-label="Zalo bilingual translator interface demonstration">
              <div>
                Chào bạn, ngày mai chúng ta gặp nhau lúc mấy giờ?
                <span>Hello, what time are we meeting tomorrow?</span>
              </div>
              <div>
                Khoảng hai giờ chiều nhé.
                <span>Around two in the afternoon.</span>
              </div>
              <b>Stop <small>Vietnamese + English · 2 translated</small></b>
            </div>
            <div className={styles.toolCopy}>
              <span>CHROME EXTENSION / ON-DEVICE</span>
              <h3>Zalo bilingual companion</h3>
              <p>Keeps the original Vietnamese message visible and adds private, on-device English underneath inside Zalo Web.</p>
              <small>TRANSLATOR API · NO API KEY · PRIVATE</small>
            </div>
          </article>
        </div>

      </section>

      <section className={styles.barberSection}>
        <article className={styles.caseStudy}>
          <div className={`${styles.projectHeading} ${styles.projectHeadingNoIndex}`}>
            <div>
              <p>WEBSITE / MEASUREMENT</p>
              <h2>Pristine Barbers</h2>
            </div>
            <p>A practical local-business website paired with booking measurement, Search Console and durable analytics reporting.</p>
          </div>

          <div className={styles.barberShowcase}>
            <div className={`${styles.browser} ${styles.barberBrowser}`}>
              <div className={styles.browserBar}><i /><i /><i /></div>
              <div className={styles.browserScreen}>
                <Image src="/portfolio/pristine-barbers.webp" alt="Pristine Barbers website homepage" fill sizes="(max-width: 800px) 92vw, 58vw" className={styles.screenshot} />
              </div>
            </div>
            <aside className={styles.analyticsCard}>
              <div className={styles.analyticsHead}>
                <span>GA4 + SEARCH CONSOLE</span>
                <i>LIVE</i>
              </div>
              <p>Latest 90-day measurement</p>
              <div className={styles.metricsGrid}>
                <div><b>3,613</b><span>Search impressions</span></div>
                <div><b>204</b><span>Active users</span></div>
                <div><b>142</b><span>Sessions from Google</span></div>
                <div><b>43</b><span>Sessions from Instagram</span></div>
                <div><b>360</b><span>Page views</span></div>
                <div><b>21</b><span>Booking clicks</span></div>
              </div>
              <div className={styles.analyticsFoot}>
                <span><i /> book_click tracked as a key event</span>
                <small>REFRESHED 21 JUL 2026</small>
              </div>
            </aside>
          </div>

          <div className={styles.projectDetails}>
            <section>
              <span>THE CHALLENGE</span>
              <p>A neighbourhood barbershop needed a clear online home that worked well on mobile, made booking obvious and could be found for useful local searches.</p>
            </section>
            <section>
              <span>OUR CONTRIBUTION</span>
              <ul>
                <li>Responsive website and booking journey</li>
                <li>GA4 booking-event measurement</li>
                <li>Search Console and local-search analysis</li>
                <li>Reusable read-only Google reporting CLI</li>
              </ul>
            </section>
            <section>
              <span>THE RESULT</span>
              <p>The business now has a measurable digital presence, a clear mobile booking route and direct visibility into how customers discover and use the site.</p>
            </section>
          </div>
        </article>
      </section>

      <section className={styles.nextProject}>
        <p>Have something in mind?</p>
        <h2>Let&apos;s make your project<br /><em>the next one.</em></h2>
        <a href="mailto:launchsetfreelancer@gmail.com">launchsetfreelancer@gmail.com <span>↗</span></a>
      </section>
    </main>
  );
}
