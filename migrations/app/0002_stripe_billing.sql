ALTER TABLE clients ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE clients ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE clients ADD COLUMN stripe_subscription_status TEXT;
ALTER TABLE clients ADD COLUMN stripe_current_period_end INTEGER;
ALTER TABLE clients ADD COLUMN stripe_cancel_at_period_end INTEGER NOT NULL DEFAULT 0;
ALTER TABLE clients ADD COLUMN payment_updated_at INTEGER;

CREATE UNIQUE INDEX clients_stripe_customer_id_idx
  ON clients(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX clients_stripe_subscription_id_idx
  ON clients(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE billing_invoices (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  number TEXT,
  status TEXT NOT NULL,
  amount_due INTEGER NOT NULL DEFAULT 0,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'gbp',
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  period_start INTEGER,
  period_end INTEGER,
  due_date INTEGER,
  paid_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX billing_invoices_client_id_idx ON billing_invoices(client_id);
CREATE INDEX billing_invoices_created_at_idx ON billing_invoices(created_at DESC);

CREATE TABLE stripe_webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  processed_at INTEGER
);
