import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() });
  }

  const { name, email, company, budget, message } = parsed.data;

  try {
    await resend.emails.send({
      from: 'Launchset <hello@launchset.dev>', // replace with a verified sender
      to: process.env.SEND_TO_EMAIL!,
      reply_to: email,
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
    console.error(err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
