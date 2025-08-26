import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY!);

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10),
  consent: z.boolean(),
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ error: 'Method not allowed' });
  }

  // Vercel usually parses JSON, but be defensive in dev/preview
  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body;
  if (!body) return res.status(400).json({ error: 'Invalid JSON' });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { name, email, company, budget, message } = parsed.data;

  try {
    await resend.emails.send({
      from: 'Launchset <no-reply@launchset.dev>', // use a verified sender or 'onboarding@resend.dev' for sandbox
      to: process.env.SEND_TO_EMAIL!,
      replyTo: email, // <-- fixed key
      subject: `New inquiry from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Company: ${company || '-'}
Budget: ${budget || '-'}
Message:
${message}
      `.trim(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
