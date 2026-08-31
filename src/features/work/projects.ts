export type WorkProject = {
  slug: string;
  title: string;
  type: string;
  summary: string;
  href: string;
  image?: string;
  imageAlt?: string;
  theme: "warm" | "aqua" | "green" | "red" | "dark" | "blue" | "navy";
  tags: readonly string[];
};

export type ProjectDetail = WorkProject & {
  intro: string;
  introParagraphs?: readonly string[];
  evidence?: readonly {
    value: string;
    label: string;
    icon: "product" | "image" | "features" | "links";
  }[];
  sections: readonly {
    label: string;
    title: string;
    copy?: string;
    items?: readonly string[];
    layout?: "problem" | "built" | "outcome";
  }[];
  metrics?: readonly { value: string; label: string }[];
  metricNote?: string;
};

const prestigeIntroParagraphs = [
  "I was introduced to Prestige Kitchens & Bedrooms by a previous client, Prestige Barbers, when the business had no website.",
  "The project began by establishing its online presence, then grew into an e-commerce platform supported by systems for processing supplier catalogues and organising more than 70GB of product files.",
  "The products Prestige has prioritised so far are now available on the site, and the platform continues to expand across more ranges. I continue to develop the platform and support the team at Prestige Kitchens & Bedrooms, helping the business grow while learning more about its needs along the way.",
] as const;

export const workProjects: readonly WorkProject[] = [
  {
    slug: "prestige-kitchens",
    title: "Prestige Kitchens",
    type: "CONSTRUCTION / E-COMMERCE",
    summary:
      "A premium, catalogue-led website that helps customers move from inspiration to the right kitchen, bedroom or product without getting lost.",
    href: "/work/prestige-kitchens",
    image: "/projects/prestige-kitchens-ferndown-hq.webp",
    imageAlt: "Prestige Kitchens website homepage",
    theme: "warm",
    tags: ["Website", "E-commerce", "Product discovery"],
  },
  {
    slug: "vietmed-travel",
    title: "Vietmed Travel",
    type: "MEDICAL TRAVEL / SUPPORT",
    summary:
      "A calm, reassuring landing experience for international patients considering medical care in Vietnam.",
    href: "/work/vietmed-travel",
    image: "/projects/vietmed-travel-current.webp",
    imageAlt: "Vietmed Travel website homepage",
    theme: "aqua",
    tags: ["Website", "Content hierarchy", "Patient support"],
  },
  {
    slug: "caple-scrape-review",
    title: "Caple Scrape Review",
    type: "SUPPLIER DATA / REVIEW",
    summary:
      "A review surface for checking scraped product data before it reaches a live catalogue.",
    href: "/work/tools/caple-scrape-review",
    image: "/portfolio/catalogue-review.webp",
    imageAlt: "Caple Scrape Review product interface",
    theme: "green",
    tags: ["Scraping", "Product data", "Human review"],
  },
  {
    slug: "lead-audit-review",
    title: "Lead Audit Review",
    type: "BUSINESS INTELLIGENCE / REVIEW",
    summary:
      "A research workspace that turns public website evidence into human-reviewed business opportunities.",
    href: "/work/tools/lead-audit-review",
    image: "/portfolio/lead-audit-review-v2.webp",
    imageAlt: "Lead Audit Review business opportunity interface",
    theme: "red",
    tags: ["Discovery", "Evidence", "Review workflow"],
  },
  {
    slug: "vietnamese-voice-translator",
    title: "Vietnamese voice translator",
    type: "LOCAL AI / ACCESSIBILITY",
    summary:
      "A local microphone tool that detects Vietnamese speech, transcribes it and translates it into English.",
    href: "/work/vietnamese-voice-translator",
    theme: "dark",
    tags: ["Whisper", "Silero VAD", "OPUS-MT"],
  },
  {
    slug: "zalo-bilingual-companion",
    title: "Zalo bilingual companion",
    type: "CHROME EXTENSION / ON-DEVICE",
    summary:
      "An on-device browser companion that keeps Vietnamese messages visible and adds English translations.",
    href: "/work/zalo-bilingual-companion",
    theme: "blue",
    tags: ["Translator API", "No API key", "Private"],
  },
  {
    slug: "pristine-barbers",
    title: "Pristine Barbers",
    type: "WEBSITE / MEASUREMENT",
    summary:
      "A local-business website paired with booking measurement, Search Console and analytics reporting.",
    href: "/work/pristine-barbers",
    image: "/portfolio/pristine-barbers.webp",
    imageAlt: "Pristine Barbers website homepage",
    theme: "navy",
    tags: ["Website", "GA4", "Search Console"],
  },
] as const;

export const projectDetails: Record<string, ProjectDetail> = {
  "prestige-kitchens": {
    ...workProjects[0],
    type: "E-COMMERCE / DATA INFRASTRUCTURE",
    title: "Prestige Kitchens & Bedrooms",
    tags: ["E-commerce", "Product data", "Automation", "Cloud infrastructure"],
    intro: prestigeIntroParagraphs.join(" "),
    introParagraphs: prestigeIntroParagraphs,
    evidence: [
      { value: "306", label: "Validated products", icon: "product" },
      { value: "786", label: "Organised supplier images", icon: "image" },
      { value: "1,862", label: "Product features", icon: "features" },
      { value: "1,361", label: "Accessory links", icon: "links" },
    ],
    sections: [
      {
        label: "03 / THE PROBLEM",
        title: "The business challenge",
        layout: "problem",
        items: [
          "Large, inconsistent supplier datasets",
          "Thousands of images and documents",
          "Inconsistent supplier formats",
          "Adding products by hand was slow",
          "Products required validation before publication",
        ],
      },
      {
        label: "WHAT I BUILT",
        title: "What I built",
        layout: "built",
      },
      {
        label: "OUTCOME AND OWNERSHIP",
        title: "Outcome and ownership",
        copy: "I led the project from requirements and system architecture through development, data processing, deployment and ongoing support.",
        layout: "outcome",
      },
    ],
  },
  "vietmed-travel": {
    ...workProjects[1],
    intro:
      "Medical travel can feel complicated and unfamiliar. The experience needed to explain the journey simply, establish trust early and make the support available before, during and after treatment feel tangible.",
    sections: [
      {
        label: "01 / THE CHALLENGE",
        title: "Make a complex decision feel understandable.",
        copy: "People considering treatment abroad need clear information without being overwhelmed. The site had to introduce the service, the journey and the people involved in a calm and reassuring way.",
      },
      {
        label: "02 / OUR CONTRIBUTION",
        title: "A guided story with clear next steps.",
        copy: "The content and interface were structured around the questions a patient is likely to have when first exploring medical care in Vietnam.",
        items: [
          "Brand-led responsive website design",
          "Clear content hierarchy for a sensitive service",
          "Health Buddy, clinic and guided-journey storytelling",
          "Accessible calls to action and mobile implementation",
        ],
      },
      {
        label: "03 / THE RESULT",
        title: "A calmer entry point.",
        copy: "A focused experience that turns a complex service into a guided, human journey with clear next steps.",
      },
    ],
  },
  "vietnamese-voice-translator": {
    ...workProjects[4],
    intro:
      "A microphone tool that listens for Vietnamese speech, transcribes it and produces an English translation entirely on the local machine.",
    sections: [
      {
        label: "01 / WHAT IT DOES",
        title: "From spoken Vietnamese to readable English.",
        copy: "The tool detects when somebody is speaking, captures the Vietnamese audio and turns it into an English translation without sending the conversation to an external service.",
      },
      {
        label: "02 / HOW IT WORKS",
        title: "Three focused parts working together.",
        copy: "Each part has one job in the local translation flow.",
        items: [
          "Silero VAD detects the start and end of speech",
          "Whisper transcribes the Vietnamese audio",
          "OPUS-MT translates the transcript into English",
        ],
      },
      {
        label: "03 / THE APPROACH",
        title: "Useful without giving up privacy.",
        copy: "Running the speech and translation models locally keeps the tool available without an API key and keeps the audio on the machine.",
      },
    ],
  },
  "zalo-bilingual-companion": {
    ...workProjects[5],
    intro:
      "A browser companion for Zalo Web that keeps the original Vietnamese message visible and adds a private English translation directly underneath it.",
    sections: [
      {
        label: "01 / WHAT IT DOES",
        title: "Two languages in the same conversation.",
        copy: "The original message stays in place so its context is never hidden. The English translation appears directly below it, making the conversation easier to follow.",
      },
      {
        label: "02 / HOW IT WORKS",
        title: "Translation inside the browser.",
        copy: "The companion watches the visible Zalo conversation and translates new Vietnamese messages on the device as they appear.",
        items: [
          "Keeps the original Vietnamese visible",
          "Adds English underneath the matching message",
          "Uses the browser Translator API without an API key",
        ],
      },
      {
        label: "03 / THE APPROACH",
        title: "A small layer, not a replacement chat app.",
        copy: "The tool adds translation to the place where the conversation already happens, while keeping the work private and on the device.",
      },
    ],
  },
  "pristine-barbers": {
    ...workProjects[6],
    intro:
      "A neighbourhood barbershop needed a clear online home that worked well on mobile, made booking obvious and could be found for useful local searches.",
    sections: [
      {
        label: "01 / THE CHALLENGE",
        title: "Turn local discovery into a clear booking route.",
        copy: "The website needed to give customers the essential information quickly, work well on a phone and make the next step obvious.",
      },
      {
        label: "02 / OUR CONTRIBUTION",
        title: "A website connected to useful measurement.",
        copy: "The project paired the customer-facing experience with reporting that shows how people discover the business and whether they move towards booking.",
        items: [
          "Responsive website and booking journey",
          "GA4 booking-event measurement",
          "Search Console and local-search analysis",
          "Reusable read-only Google reporting CLI",
        ],
      },
      {
        label: "03 / THE RESULT",
        title: "A measurable local presence.",
        copy: "The business now has a clear mobile booking route and direct visibility into how customers discover and use the site.",
      },
    ],
    metrics: [
      { value: "3,613", label: "Search impressions" },
      { value: "204", label: "Active users" },
      { value: "142", label: "Sessions from Google" },
      { value: "43", label: "Sessions from Instagram" },
      { value: "360", label: "Page views" },
      { value: "21", label: "Booking clicks" },
    ],
    metricNote: "Latest 90-day measurement · refreshed 21 Jul 2026",
  },
};
