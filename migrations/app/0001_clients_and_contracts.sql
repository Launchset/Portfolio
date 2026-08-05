PRAGMA foreign_keys = ON;

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  monthly_fee_cents INTEGER NOT NULL CHECK (monthly_fee_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'gbp',
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'contract_signed', 'active', 'cancelled')),
  invited_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_key TEXT NOT NULL UNIQUE,
  signed_key TEXT UNIQUE,
  original_sha256 TEXT NOT NULL,
  signed_sha256 TEXT,
  status TEXT NOT NULL DEFAULT 'awaiting_signature' CHECK (status IN ('awaiting_signature', 'signed', 'void')),
  signature_page INTEGER NOT NULL DEFAULT -1,
  signature_x REAL NOT NULL DEFAULT 54,
  signature_y REAL NOT NULL DEFAULT 54,
  signature_width REAL NOT NULL DEFAULT 180,
  signature_height REAL NOT NULL DEFAULT 64,
  signer_name TEXT,
  signer_email TEXT,
  signed_by_user_id TEXT,
  signed_at INTEGER,
  signature_ip TEXT,
  signature_user_agent TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX contracts_client_id_idx ON contracts(client_id);
CREATE INDEX contracts_status_idx ON contracts(status);
