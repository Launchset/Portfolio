PRAGMA foreign_keys = ON;
-- The intake nonce prevents a replay from enabling content capture retrospectively.
ALTER TABLE connect_events ADD COLUMN intake_nonce TEXT;

CREATE TABLE connect_messages (
  event_id TEXT PRIMARY KEY REFERENCES connect_events(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sent_at INTEGER NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  document_json TEXT,
  routed_label TEXT NOT NULL,
  target_key TEXT,
  target_revision TEXT
);

CREATE TABLE connect_backend_deliveries (
  event_id TEXT PRIMARY KEY REFERENCES connect_messages(event_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','failed','cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL,
  claim_token TEXT,
  claimed_at INTEGER,
  sent_at INTEGER,
  error_code TEXT
);
CREATE INDEX connect_backend_deliveries_due ON connect_backend_deliveries(status,next_attempt_at);

CREATE TABLE connect_replies (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES connect_messages(event_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('processing','accepted','rejected','unknown')),
  provider_message_id TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(event_id,id)
);
