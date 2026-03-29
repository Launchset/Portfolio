import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { google } from "googleapis";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().max(254),
  business: z.string().trim().max(120).optional().default(""),
  budget: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(10).max(3000),
  consent: z.preprocess(
    (value) => value === true || value === "true" || value === "on",
    z.literal(true)
  ),
  company_website: z.string().trim().max(0).optional(),
});

type Lead = z.infer<typeof leadSchema>;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getGoogleCredentials() {
  try {
    return JSON.parse(getRequiredEnv("GOOGLE_CREDENTIALS"));
  } catch {
    throw new Error("GOOGLE_CREDENTIALS must be valid JSON");
  }
}

function createClients() {
  const resend = new Resend(getRequiredEnv("RESEND_API_KEY"));
  const auth = new google.auth.GoogleAuth({
    credentials: getGoogleCredentials(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  return {
    resend,
    sheets,
    fromEmail: getRequiredEnv("FROM_EMAIL"),
    toEmail: getRequiredEnv("TO_EMAIL"),
    sheetId: getRequiredEnv("SHEET_ID"),
  };
}

async function addLeadToSheet(
  lead: Lead,
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string
) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          lead.name,
          lead.email,
          lead.business,
          lead.budget,
          lead.message,
          lead.consent ? "Yes" : "No",
          new Date().toISOString(),
        ],
      ],
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsedLead = leadSchema.safeParse(req.body ?? {});
    if (!parsedLead.success) {
      return res.status(400).json({ status: "fail", error: "Invalid request" });
    }

    const lead = parsedLead.data;
    if (lead.company_website) {
      return res.status(200).json({ status: "ok" });
    }

    const { resend, sheets, fromEmail, toEmail, sheetId } = createClients();

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New inquiry from ${lead.name}`,
      text: `
Name: ${lead.name}
Email: ${lead.email}
Business: ${lead.business || "-"}
Budget: ${lead.budget || "-"}
Consent: ${lead.consent ? "Yes" : "No"}

Message:
${lead.message}
      `.trim(),
    });

    await addLeadToSheet(lead, sheets, sheetId);

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Contact handler error:", error);
    return res.status(500).json({ status: "fail" });
  }
}
