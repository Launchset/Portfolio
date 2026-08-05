import { createAuth } from "@/src/lib/auth";

async function handle(request: Request) {
  const auth = await createAuth(request);
  return auth.handler(request);
}

export { handle as GET, handle as POST };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
