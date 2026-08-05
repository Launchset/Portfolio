import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";

type AuthEnvironment = CloudflareEnv & {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function createAuth(request?: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const authEnv = env as AuthEnvironment;
  const requestOrigin = request ? new URL(request.url).origin : undefined;
  const baseURL = requestOrigin ?? authEnv.BETTER_AUTH_URL ?? "https://launchset.dev";

  const socialProviders = {
    ...(authEnv.GOOGLE_CLIENT_ID && authEnv.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: authEnv.GOOGLE_CLIENT_ID,
            clientSecret: authEnv.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  };

  return betterAuth({
    appName: "Launchset",
    baseURL,
    trustedOrigins: [
      "https://launchset.dev",
      "https://launchset-shadow.jhelyar04.workers.dev",
      "http://localhost:3000",
    ],
    secret: authEnv.BETTER_AUTH_SECRET,
    database: authEnv.AUTH_DB,
    emailAndPassword: { enabled: false },
    socialProviders,
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      database: { generateId: "uuid" },
      useSecureCookies: baseURL.startsWith("https://"),
    },
    plugins: [
      magicLink({
        expiresIn: 60 * 15,
        storeToken: "hashed",
        rateLimit: { window: 60, max: 3 },
        sendMagicLink: async ({ email, url }) => {
          const safeUrl = escapeHtml(url);
          await authEnv.AUTH_EMAIL.send({
            from: authEnv.AUTH_EMAIL_FROM,
            to: email,
            subject: "Your secure Launchset sign-in link",
            text: `Use this one-time link to sign in to Launchset:\n\n${url}\n\nThis link expires in 15 minutes. If you did not request it, you can ignore this email.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#142019"><p style="font-size:12px;letter-spacing:.14em;color:#59742a">LAUNCHSET</p><h1 style="font-size:28px">Your secure sign-in link</h1><p>Confirm this email address and sign in with the button below.</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:13px 18px;border-radius:9px;background:#25d38a;color:#06110c;text-decoration:none;font-weight:700">Verify email and sign in</a></p><p style="color:#66736b;font-size:13px">This one-time link expires in 15 minutes. If you did not request it, you can ignore this email.</p></div>`,
          });
        },
      }),
    ],
  });
}

export function isLaunchsetAdmin(email: string | null | undefined, adminEmail: string) {
  return email?.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}

export async function getAdminEmail() {
  const { env } = await getCloudflareContext({ async: true });
  return env.AUTH_ADMIN_EMAIL;
}
