-- migrations/001_initial_schema.sql
-- VibeKit Studio — complete PostgreSQL schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Auto-update trigger ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ─── Users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL CHECK (char_length(name) >= 2),
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Refresh tokens ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rt_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_rt_expires ON refresh_tokens(expires_at);

-- ─── Pages ────────────────────────────────────────────────────────────────
CREATE TYPE page_status AS ENUM ('draft', 'published');

CREATE TABLE IF NOT EXISTS pages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL CHECK (char_length(title) >= 2),
  slug         VARCHAR(110) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  theme        VARCHAR(50)  NOT NULL CHECK (theme IN ('minimal','neo-brutal','dark-neon','pastel-soft','luxury-serif','retro-pixel')),
  sections     JSONB        NOT NULL DEFAULT '[]',
  status       page_status  NOT NULL DEFAULT 'draft',
  view_count   INTEGER      NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  published_at TIMESTAMPTZ,
  deleted_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT pages_published_at_sync CHECK (
    (status='published' AND published_at IS NOT NULL) OR status='draft'
  )
);
CREATE INDEX IF NOT EXISTS idx_pages_user_id   ON pages(user_id)    WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pages_slug      ON pages(slug)       WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pages_status    ON pages(status)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(slug,status) WHERE status='published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pages_sections  ON pages USING GIN(sections);
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Page views ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id    UUID        NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitor_ip INET        NOT NULL,
  user_agent VARCHAR(500),
  referrer   VARCHAR(500),
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pv_page_id  ON page_views(page_id);
CREATE INDEX IF NOT EXISTS idx_pv_dedup    ON page_views(page_id, visitor_ip, viewed_at DESC);

-- ─── Contact submissions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id    UUID         NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(255) NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message    TEXT         NOT NULL CHECK (char_length(message) >= 10),
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cs_page_id ON contact_submissions(page_id);
CREATE INDEX IF NOT EXISTS idx_cs_unread  ON contact_submissions(page_id) WHERE is_read=FALSE;

-- ─── Slug history (for redirects after renames) ────────────────────────────
CREATE TABLE IF NOT EXISTS slug_history (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id    UUID         NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  old_slug   VARCHAR(110) NOT NULL CHECK (old_slug ~ '^[a-z0-9-]+$'),
  new_slug   VARCHAR(110) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sh_old_slug ON slug_history(old_slug);

CREATE OR REPLACE FUNCTION record_slug_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.slug IS DISTINCT FROM NEW.slug AND OLD.slug IS NOT NULL THEN
    INSERT INTO slug_history(page_id, old_slug, new_slug)
    VALUES (NEW.id, OLD.slug, NEW.slug) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_slug_change AFTER UPDATE OF slug ON pages
  FOR EACH ROW EXECUTE FUNCTION record_slug_change();
