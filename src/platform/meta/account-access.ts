import type { ConnectEnvironment } from "../../features/connect/types";

export async function checkWhatsAppAccountAccess(environment: ConnectEnvironment, wabaId: string, phoneNumberId: string) {
  const version = environment.CONNECT_META_GRAPH_API_VERSION;
  const token = environment.CONNECT_META_ACCESS_TOKEN;
  if (!token || !version || !/^v\d{1,2}\.\d$/.test(version)) throw new Error("Meta account access is not configured.");
  let after = "";
  for (let page = 0; page < 10; page++) {
    const url = new URL(`https://graph.facebook.com/${version}/${wabaId}/phone_numbers`);
    url.searchParams.set("fields", "id,display_phone_number,verified_name");
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);
    let response;
    try { response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }); }
    catch { throw new Error("Meta could not be reached. Try the access check again."); }
    if (!response.ok) throw new Error("Meta did not allow this account access. Check the token and assigned WhatsApp account.");
    const result = await response.json() as { data?: Array<{ id?: string }>; paging?: { next?: string; cursors?: { after?: string } } };
    if (result.data?.some((phone) => phone.id === phoneNumberId)) return;
    if (!result.paging?.next || !result.paging.cursors?.after) break;
    after = result.paging.cursors.after;
  }
  throw new Error("This phone number ID was not found in the authorised WhatsApp account.");
}
