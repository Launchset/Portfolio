PRAGMA foreign_keys = ON;

CREATE TABLE connect_businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  waba_id TEXT NOT NULL,
  phone_number_id TEXT NOT NULL UNIQUE,
  member_email TEXT NOT NULL DEFAULT '' COLLATE NOCASE,
  email_to TEXT NOT NULL DEFAULT '',
  telegram_chat_id TEXT NOT NULL DEFAULT '',
  route_label TEXT NOT NULL DEFAULT 'General enquiries',
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
  last_checked_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE connect_events (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES connect_businesses(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  message_type TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  route_label TEXT NOT NULL,
  email_to TEXT NOT NULL DEFAULT '',
  telegram_chat_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),
  UNIQUE (business_id, message_id)
);
CREATE INDEX connect_events_business_time ON connect_events(business_id, received_at DESC);

CREATE TABLE connect_deliveries (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES connect_events(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'telegram')),
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL,
  claim_token TEXT,
  claimed_at INTEGER,
  sent_at INTEGER,
  error_code TEXT,
  UNIQUE (event_id, channel)
);
CREATE INDEX connect_deliveries_due ON connect_deliveries(status, next_attempt_at);
