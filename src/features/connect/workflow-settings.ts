import type { ConnectEnvironment } from "./types";

export type RoutingRule = { label: string; sender?: string; type?: string; contains?: string };
export type Workflow = { businessId: string; phoneNumberId: string; rules: RoutingRule[]; destinations: Record<string, string>;
  alerts?: Record<string, { emailTo: string; telegramChatId: string }> };
export type BackendTarget = { key: string; businessId: string; url: string; secret: string };
type Configuration = { testPhoneNumberId: string; workflows: Workflow[]; targets: BackendTarget[] };

// Deployment-owned allowlist. Customer text and API requests cannot supply URLs or secrets.
export function workflowConfiguration(environment: ConnectEnvironment): Configuration | null {
  if (!environment.CONNECT_WORKFLOWS) return null;
  try {
    const input = JSON.parse(environment.CONNECT_WORKFLOWS) as Configuration;
    if (!/^\d{1,40}$/.test(input.testPhoneNumberId) || !Array.isArray(input.workflows) || !Array.isArray(input.targets)
      || input.workflows.length > 20 || input.targets.length > 20) return null;
    const keys = new Set<string>();
    const secrets = new Set<string>();
    for (const target of input.targets) {
      if (!/^[a-z][a-z0-9_-]{0,39}$/.test(target.key) || keys.has(target.key) || typeof target.businessId !== "string"
        || typeof target.secret !== "string" || target.secret.length < 32 || secrets.has(target.secret) || typeof target.url !== "string") return null;
      keys.add(target.key);
      secrets.add(target.secret);
      const url = new URL(target.url);
      if (url.protocol !== "https:" || url.username || url.password || url.hash || url.port
        || !/^[a-z][a-z0-9.-]+\.[a-z]{2,}$/.test(url.hostname) || url.hostname.endsWith(".localhost")
        || url.hostname.endsWith(".local") || url.hostname.endsWith(".internal")) return null;
    }
    const businessIds = new Set<string>();
    for (const workflow of input.workflows) {
      if (typeof workflow.businessId !== "string" || businessIds.has(workflow.businessId) || workflow.phoneNumberId !== input.testPhoneNumberId
        || !Array.isArray(workflow.rules) || workflow.rules.length > 50 || !workflow.destinations || typeof workflow.destinations !== "object"
        || Array.isArray(workflow.destinations)) return null;
      businessIds.add(workflow.businessId);
      for (const rule of workflow.rules) {
        if (!rule || typeof rule.label !== "string" || !rule.label.trim() || rule.label.length > 100
          || (rule.sender !== undefined && (typeof rule.sender !== "string" || !rule.sender || rule.sender.length > 128))
          || (rule.type !== undefined && !/^[a-z_]{1,40}$/.test(rule.type))
          || (rule.contains !== undefined && (typeof rule.contains !== "string" || !rule.contains.trim() || rule.contains.length > 200))
          || (!rule.sender && !rule.type && !rule.contains)) return null;
      }
      for (const [label, key] of Object.entries(workflow.destinations)) {
        if (!label.trim() || label.length > 100 || !input.targets.some((target) => target.key === key && target.businessId === workflow.businessId)) return null;
      }
      if (workflow.alerts !== undefined) {
        if (!workflow.alerts || typeof workflow.alerts !== "object" || Array.isArray(workflow.alerts)) return null;
        for (const [label, alerts] of Object.entries(workflow.alerts)) {
          if (!label.trim() || label.length > 100 || !alerts || typeof alerts.emailTo !== "string" || typeof alerts.telegramChatId !== "string"
            || (alerts.emailTo && (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(alerts.emailTo) || alerts.emailTo.length > 254))
            || (alerts.telegramChatId && !/^-?\d{1,20}$/.test(alerts.telegramChatId))) return null;
        }
      }
    }
    return input;
  } catch { return null; }
}

export function matchRoutingLabel(workflow: Workflow, sender: string, type: string, text: string, fallback: string) {
  // Rules run in order; every supplied condition must match. No model or regex execution.
  return workflow.rules.find((rule) => (!rule.sender || rule.sender === sender) && (!rule.type || rule.type === type)
    && (!rule.contains || text.toLocaleLowerCase("en").includes(rule.contains.toLocaleLowerCase("en"))))?.label || fallback;
}

export async function targetRevision(target: BackendTarget) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify([target.key, target.businessId, target.url])));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
