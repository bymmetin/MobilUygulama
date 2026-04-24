-- ============================================================
-- Mnemo — Supabase Veritabanı Şeması
-- Tablo yapısı, RLS politikaları ve izinler
-- ============================================================

-- Konular
CREATE TABLE IF NOT EXISTS topics (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title       TEXT NOT NULL,
  description TEXT,
  order_num   INTEGER
);

-- Dersler
CREATE TABLE IF NOT EXISTS lessons (
  id        BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  topic_id  BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  order_num INTEGER
);

-- Sorular
CREATE TABLE IF NOT EXISTS questions (
  id             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lesson_id      BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  option_a       TEXT,
  option_b       TEXT,
  option_c       TEXT,
  option_d       TEXT,
  correct_answer TEXT NOT NULL,
  image_url      TEXT,
  audio_url      TEXT
);

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE topics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons   ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni (anonim kullanıcılar veri çekebilsin)
CREATE POLICY "Public read" ON topics    FOR SELECT USING (true);
CREATE POLICY "Public read" ON lessons   FOR SELECT USING (true);
CREATE POLICY "Public read" ON questions FOR SELECT USING (true);

-- anon rolüne SELECT yetkisi
GRANT SELECT ON topics    TO anon;
GRANT SELECT ON lessons   TO anon;
GRANT SELECT ON questions TO anon;
