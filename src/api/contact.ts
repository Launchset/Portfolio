import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { google } from "googleapis";

// Resend setup
const resend = new Resend(process.env.RESEND_API_KEY);

// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS as string),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// Append a row to the sheet
async function addLeadToSheet(lead: any) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        lead.name,
        lead.email,
        lead.business || "",
        lead.budget || "",
        lead.message || "",
        lead.consent ? "Yes" : "No",
        new Date().toISOString(),
      ]],
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, business, budget, message, consent } = req.body;

    // Send email
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.TO_EMAIL!,
      subject: `New inquiry from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Business: ${business || "-"}
Budget: ${budget || "-"}
Consent: ${consent ? "Yes" : "No"}

Message:
${message}
      `.trim(),
    });

    // Log to Google Sheet
    await addLeadToSheet({ name, email, business, budget, message, consent });

    return res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error("Error:", error.message);
    return res.status(500).json({ status: "fail" });
  }
}
