-- Community problem reports (expired, spoiled, wrong label).
-- Nothing is public until a moderator approves it.

CREATE TABLE product_reports (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id      INTEGER NOT NULL REFERENCES products (id),
    governorate_id  SMALLINT NOT NULL REFERENCES governorates (id),
    reason          TEXT NOT NULL CHECK (reason IN ('expired', 'spoiled', 'wrong_label', 'other')),
    note            TEXT CHECK (char_length(note) <= 300),
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ
);

-- Public listing: approved reports for one product, newest first.
CREATE INDEX product_reports_public ON product_reports (product_id, created_at DESC) WHERE status = 'approved';

-- Moderation queue: oldest pending first.
CREATE INDEX product_reports_pending ON product_reports (created_at) WHERE status = 'pending';
