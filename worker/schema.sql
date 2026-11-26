-- One row per subscribed phone. No name, email, phone number or location.
CREATE TABLE IF NOT EXISTS subs (
  id TEXT PRIMARY KEY,              -- random 128-bit id
  token_hash TEXT NOT NULL,         -- sha-256 of a random secret held only by the phone
  endpoint TEXT NOT NULL UNIQUE,    -- push address (never logged)
  p256dh TEXT NOT NULL, auth TEXT NOT NULL,   -- encryption keys (never logged)
  tz TEXT NOT NULL DEFAULT 'Africa/Cairo',
  interval INTEGER NOT NULL DEFAULT 0,        -- minutes, 0 = off
  win_from TEXT, win_to TEXT,                 -- HH:MM window for the interval reminders
  fixed TEXT NOT NULL DEFAULT '[]',           -- JSON list of HH:MM daily reminders
  last_sent_ms INTEGER NOT NULL DEFAULT 0,
  last_ok_ms INTEGER NOT NULL,                -- last time the push service accepted a push (or creation)
  fail INTEGER NOT NULL DEFAULT 0,
  created_ms INTEGER NOT NULL
);
