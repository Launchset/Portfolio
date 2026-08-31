export const prestigeBuildAreas = [
  {
    label: "STOREFRONT",
    title: "A complete route from browsing to buying",
    copy: "The customer-facing website turns the catalogue into a clear journey across discovery, enquiry and purchase.",
    details: [
      ["Catalogue browsing", "Category pages help customers find the right products."],
      ["Product pages", "Images, features, specifications and compatible accessories stay together."],
      ["Basket and checkout", "Customers can build an order and pay through secure Stripe checkout."],
      ["Accounts and orders", "Customers can securely access payments and order history using Google or a one-time email link."],
    ],
  },
  {
    label: "PRODUCT SYSTEM",
    title: "Product review and publishing",
    copy: "I built internal tools to review and approve supplier information before products appeared on the website.",
    details: [
      ["Catalogue review", "Product details, images, features and accessories can all be checked in one place."],
      ["Image ordering", "Product images can be approved and placed in the correct order."],
      ["Feature review", "Features extracted from supplier PDFs are checked before being added to the product catalogue."],
      ["Publishing controls", "Products must be reviewed and approved before appearing on the live website."],
    ],
  },
  {
    label: "DATA PIPELINES",
    title: "Supplier information",
    copy: "I built tools to process large supplier catalogues and flag uncertain information for review.",
    details: [
      ["Scraping", "Supplier pages were collected automatically, with failed requests retried and progress saved along the way."],
      ["Cleaning", "Unwanted page text, duplicate information and inconsistent formatting were flagged for review."],
      ["Product matching", "Supplier product codes were used to connect each product with the correct category, images and accessories."],
      ["Importing", "Once approved, products were added to the catalogue with their images, specifications and links to compatible accessories and related products."],
    ],
  },
  {
    label: "INFRASTRUCTURE",
    title: "Website infrastructure",
    copy: "The website and its data run on infrastructure designed for a growing business.",
    details: [
      ["Cloudflare Workers", "Runs the website on Cloudflare’s global network so pages respond quickly. OpenNext adapts the Next.js server code to run inside Cloudflare Workers."],
      ["D1 and R2", "D1 holds the product information, while R2 holds the images and documents. Technically, D1 is Cloudflare’s serverless SQL database and R2 is its object-storage service."],
      ["Stripe", "Creates secure checkout sessions and records payment status."],
      ["Transactional email", "Sends sign-in links, customer messages and enquiry notifications."],
    ],
  },
] as const;

export const prestigeTechnicalChallenges = [
  {
    title: "Turning 70GB of supplier files into a usable media system",
    titleLines: ["Turning", "70GB of supplier files", "into a usable media system"],
    visual: "assets",
    problem: "Prestige was given more than 70GB of product images and documents by its suppliers. They were difficult to organise and match to the right products. Technically, the files arrived in inconsistent folders, formats, sizes and resolutions, so they could not be safely used on the website.",
    decision: "I built a repeatable system to prepare and organise every approved image. Processing jobs converted files to WebP, assigned stable Cloudflare R2 locations and recorded their dimensions, supplier product codes and display order.",
    result: "Prestige now has an organised image library connected to the correct products. Each catalogue entry points to consistent, web-ready files stored in R2.",
  },
  {
    title: "Turning supplier PDFs into reviewed product data",
    titleLines: ["Turning", "supplier PDFs", "into reviewed product data"],
    visual: "pdf",
    problem: "Important product details were locked inside supplier PDFs and had to be separated before use. Technically, features, physical dimensions, warranty information and repeated page content were mixed within layouts designed for people rather than software.",
    decision: "I built a system that extracts possible product features and presents them for human approval. Deterministic PDF parsing handles predictable content. When PDF formats vary, a locally run AI model identifies likely product features within less predictable text. Its output is restricted to a defined structure and sent for human review; neither the parser nor the AI can write directly to the live catalogue.",
    result: "Approved information can be added to the catalogue without blindly trusting automation. Every feature is stored as structured catalogue data with a recorded human decision and audit trail.",
  },
  {
    title: "Making Stripe reliable on Cloudflare Workers",
    titleLines: ["Making", "Stripe reliable", "on Cloudflare Workers"],
    visual: "payments",
    problem: "Customers could be left waiting at checkout because the connection to Stripe did not always complete correctly. Technically, Stripe’s default Node.js transport was unreliable inside the Cloudflare Worker runtime and could leave requests open indefinitely.",
    decision: "I changed how the website communicates with Stripe and added safeguards so checkout either completes or returns a clear error. The Stripe SDK now uses Fetch transport with explicit timeouts, idempotency keys prevent duplicate checkout sessions, and prices are recalculated securely on the server.",
    result: "Customers receive a more dependable checkout and a clear response when something goes wrong. Duplicate sessions are controlled, and order history is updated only when the payment state has been confirmed.",
  },
] as const;

export const prestigeScreenshots = [
  {
    src: "/projects/prestige-screenshots/product-category.png",
    alt: "Prestige Kitchens and Bedrooms sink category page showing stainless steel, packs, granite and ceramic ranges",
    width: 1440,
    height: 1000,
  },
  {
    src: "/projects/prestige-screenshots/product-detail.png",
    alt: "Prestige product page for a grey granite sink with price, physical dimensions, features and basket controls",
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

export const prestigeTechnologies = [
  "Next.js",
  "TypeScript",
  "Cloudflare Workers",
  "OpenNext",
  "D1",
  "R2",
  "Stripe",
  "Better Auth",
] as const;
