import { getPortalEnvironment } from "./access";

export type ClientAccount = {
  id: string;
  name: string;
  email: string;
  monthly_fee_cents: number;
  currency: string;
  status: string;
  contract_id: string | null;
  contract_title: string | null;
  contract_status: string | null;
  signed_at: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  stripe_current_period_end: number | null;
  stripe_cancel_at_period_end: number;
  stripe_collection_paused: number;
};

export type ClientInvoice = {
  id: string;
  number: string | null;
  status: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created_at: number;
};

export type ClientAccountData = {
  client: ClientAccount;
  invoices: ClientInvoice[];
};

export async function getClientAccountData(
  clientId: string,
): Promise<ClientAccountData | null> {
  const { APP_DB } = await getPortalEnvironment();
  const client = await APP_DB.prepare(
    `SELECT clients.*, contracts.id AS contract_id, contracts.title AS contract_title,
     contracts.status AS contract_status, contracts.signed_at
     FROM clients LEFT JOIN contracts ON contracts.client_id = clients.id
     WHERE clients.id = ? AND clients.archived_at IS NULL
     ORDER BY contracts.created_at DESC LIMIT 1`,
  )
    .bind(clientId)
    .first<ClientAccount>();
  if (!client) return null;

  const invoices =
    (
      await APP_DB.prepare(
        `SELECT id, number, status, amount_paid, amount_due, currency, hosted_invoice_url, invoice_pdf, created_at
     FROM billing_invoices WHERE client_id = ? ORDER BY created_at DESC LIMIT 12`,
      )
        .bind(client.id)
        .all<ClientInvoice>()
    ).results ?? [];

  return { client, invoices };
}
