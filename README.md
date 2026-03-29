# Launchset Portfolio

Marketing site and contact funnel for Launchset, built with React and Vite and deployed with a Vercel serverless contact endpoint.

## Stack

- React 19
- Vite 7
- Plain CSS
- Vercel serverless function for contact handling
- Resend for notification email delivery
- Google Sheets for lead logging

## Local Development

Install dependencies and start the frontend:

```bash
npm install
npm run dev
```

The site runs locally at `http://localhost:5173` by default.

## Contact Form Setup

The contact form posts to `/api/contact`. The serverless function expects these environment variables:

- `RESEND_API_KEY`
- `FROM_EMAIL`
- `TO_EMAIL`
- `GOOGLE_CREDENTIALS`
- `SHEET_ID`

`GOOGLE_CREDENTIALS` must be a valid JSON string for a Google service account with access to the target sheet.

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run preview` serves the production build locally

## Notes

- Form submissions are validated server-side before email delivery or sheet logging.
- Analytics is enabled in production and skipped on localhost.
- Static SEO assets live in `public/`.
