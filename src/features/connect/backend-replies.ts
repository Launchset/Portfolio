import type { ConnectEnvironment } from "./types";
import { workflowConfiguration, targetRevision } from "./workflow-settings";
import { getConnectMessage, replyToConnectMessage } from "./message-workflows";
import { verifyBackendRequest } from "../../platform/notifications/backend-auth";
import { MessageActionError } from "../../platform/meta/message-actions";

export async function receiveBackendReply(environment: ConnectEnvironment, key: string, raw: Uint8Array,
  timestamp: string | null, signature: string | null, now = Date.now()) {
  const configuration = workflowConfiguration(environment);
  const target = configuration?.targets.find((item) => item.key === key);
  if (!target || !await verifyBackendRequest(target.secret, timestamp, signature, raw, now)) throw new MessageActionError("backend_not_authorised");
  let input;
  try { input = JSON.parse(new TextDecoder().decode(raw)); } catch { throw new MessageActionError("invalid_reply"); }
  if (!input || input.operation !== "reply" || input.backend_key !== key || typeof input.event_id !== "string"
    || !/^[a-f0-9]{64}$/.test(input.event_id) || typeof input.request_id !== "string" || typeof input.text !== "string")
    throw new MessageActionError("invalid_reply");
  const message = await getConnectMessage(environment.APP_DB, input.event_id, "", true);
  // Receiver may reply only to events routed to its own business/endpoint. It cannot choose a recipient.
  if (!message || message.business_id !== target.businessId || message.target_key !== key || message.target_revision !== await targetRevision(target))
    throw new MessageActionError("backend_not_authorised");
  return replyToConnectMessage(environment, input.event_id, "", true, input.request_id, input.text, now);
}
