import { connectJson, connectRequestAccess } from "@/src/features/connect/http-access";
import type { ConnectBusiness } from "@/src/features/connect/types";
import { checkWhatsAppAccountAccess } from "@/src/platform/meta/account-access";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await connectRequestAccess(request, true);
  if (!access) return connectJson({ error: "Not authorised." }, 403);
  const { id } = await params;
  const business = await access.environment.APP_DB.prepare("SELECT * FROM connect_businesses WHERE id = ? AND (? = 1 OR member_email = ? COLLATE NOCASE)")
    .bind(id, Number(access.admin), access.user.email).first<ConnectBusiness>();
  if (!business) return connectJson({ error: "Business not found." }, 404);
  try { await checkWhatsAppAccountAccess(access.environment, business.waba_id, business.phone_number_id); }
  catch (error) { return connectJson({ error: error instanceof Error ? error.message : "Meta access check failed." }, 409); }
  await access.environment.APP_DB.prepare("UPDATE connect_businesses SET last_checked_at = ? WHERE id = ?").bind(Date.now(), id).run();
  return connectJson({ checked: true });
}
