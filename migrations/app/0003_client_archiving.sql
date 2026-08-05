ALTER TABLE clients ADD COLUMN archived_at INTEGER;

CREATE INDEX clients_archived_at_idx ON clients(archived_at);
