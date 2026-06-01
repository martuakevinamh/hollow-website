-- ============================================
-- THE HOLLOW BLOCK — SUPABASE SCHEMA
-- Jalankan di Supabase SQL Editor
-- ============================================

-- ============================================
-- TABEL: members
-- ============================================
CREATE TABLE IF NOT EXISTS public.members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_rp     TEXT NOT NULL,
  rank        TEXT NOT NULL CHECK (rank IN ('TOP OG/KING','OG','Top Boy','Brudda','Rude Boy','The Youth','Muscle')),
  server      TEXT NOT NULL CHECK (server IN ('samp','fivem','both')) DEFAULT 'samp',
  bio         TEXT,
  photo_url   TEXT,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk sorting
CREATE INDEX IF NOT EXISTS idx_members_rank ON public.members(rank);
CREATE INDEX IF NOT EXISTS idx_members_active ON public.members(is_active);

-- Row Level Security
-- Row Level Security (Di-disable agar admin panel client bisa melakukan CRUD data secara langsung)
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TABEL: news
-- ============================================
CREATE TABLE IF NOT EXISTS public.news (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content          TEXT NOT NULL,
  server           TEXT NOT NULL CHECK (server IN ('samp','fivem','both')) DEFAULT 'both',
  cover_image_url  TEXT,
  author           TEXT NOT NULL DEFAULT 'Admin',
  published_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news(is_published, published_at DESC);

ALTER TABLE public.news DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TABEL: gallery
-- ============================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  image_url    TEXT NOT NULL,
  server       TEXT NOT NULL CHECK (server IN ('samp','fivem','both')) DEFAULT 'both',
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_uploaded ON public.gallery(uploaded_at DESC);

ALTER TABLE public.gallery DISABLE ROW LEVEL SECURITY;


-- ============================================
-- STORAGE BUCKET: gallery-images
-- Buat di Supabase Dashboard > Storage
-- Atau jalankan jika pakai Supabase CLI:
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('gallery-images', 'gallery-images', TRUE);

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('member-photos', 'member-photos', TRUE);


-- ============================================
-- SAMPLE DATA (opsional, untuk testing)
-- ============================================
INSERT INTO public.members (name_rp, rank, server, bio, is_active) VALUES
  ('Shadow King',  'TOP OG/KING', 'both',  'Pendiri The Hollow Block. Legend yang dihormati di seluruh block.', TRUE),
  ('Ghost Reaper', 'OG',          'fivem', 'Senior berpengaruh, mantan Top Boy yang jadi panutan semua anggota.', TRUE),
  ('Iron Mike',    'Top Boy',     'samp',  'Ngatur operasi blok timur. Keputusannya tidak pernah dipertanyakan.', TRUE),
  ('Blaze UK',     'Brudda',      'both',  'Anggota resmi yang sudah dianggap keluarga oleh seluruh block.', TRUE),
  ('Young Flex',   'Rude Boy',    'fivem', 'Pemuda keras jalanan yang mulai dihormati di lingkungannya.', TRUE),
  ('Lil Shan',     'The Youth',   'samp',  'Baru mulai belajar kode jalanan dan cara hidup di block.', TRUE),
  ('Rookie D',     'Muscle',      'both',  'Sering nongkrong bareng geng, belum resmi tapi sudah terbukti.', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO public.news (title, slug, content, server, author, is_published) VALUES
  (
    'The Hollow Block Resmi Hadir di FiveM!',
    'thb-hadir-di-fivem',
    'Setelah berbulan-bulan persiapan, The Hollow Block kini resmi hadir di platform GTA FiveM.

Kami membawa semua tradisi dan kultur jalanan UK yang sudah kami bangun di SAMP ke dalam platform yang lebih modern dengan grafis yang lebih realistis.

Server FiveM kami dilengkapi dengan custom MLO, script gang warfare, dan economy system yang kami kembangkan khusus untuk komunitas THB.

Bergabunglah sekarang melalui Discord kami dan jadilah bagian dari era baru The Hollow Block!',
    'fivem',
    'Admin',
    TRUE
  ),
  (
    'Event Gang War Bulan Juni 2026',
    'gang-war-juni-2026',
    'The Hollow Block mengundang seluruh anggota aktif untuk berpartisipasi dalam Gang War event eksklusif bulan Juni 2026.

Event ini akan berlangsung selama satu minggu penuh dengan berbagai skenario roleplay yang telah disiapkan oleh tim pengurus.

Ada hadiah rank upgrade bagi anggota yang menunjukkan performa terbaik selama event berlangsung.

Detail jadwal dan rules lengkap tersedia di channel #event-info di Discord kami.',
    'samp',
    'Ghost Reaper',
    TRUE
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.gallery (title, image_url, server) VALUES
  ('The Block Takeover', 'https://placeholder.co/800x600/1C2951/F5F5F5?text=THB+Gallery', 'samp'),
  ('Gang War 2025', 'https://placeholder.co/800x600/B22234/F5F5F5?text=Gang+War', 'both'),
  ('FiveM Launch Night', 'https://placeholder.co/800x600/09090f/B22234?text=FiveM+Launch', 'fivem')
ON CONFLICT DO NOTHING;


-- ============================================
-- TABEL: settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- SEED DATA: settings
INSERT INTO public.settings (key, value) VALUES
  ('about_story_title', 'Dari Jalanan London ke Dunia Roleplay'),
  ('about_story_desc', 'Hollow lahir dari hasrat sekelompok pemain roleplay yang ingin menghadirkan pengalaman gang UK yang autentik di dunia GTA. Terinspirasi dari kultur jalanan London — drill music, grime culture, dan dinamika gang block — kami membangun komunitas yang lebih dari sekedar game.'),
  ('about_samp_title', 'Lore & Sejarah di GTA SA:MP'),
  ('about_samp_content', 'Di platform GTA SA:MP, komunitas kami dikenal luas dengan nama The Hollow Block (THB). Faksi ini dirintis untuk menghidupkan kembali kultur gang jalanan UK dengan detail mekanis khas server SA:MP. Fokus utama kami di platform ini adalah koordinasi taktis, perang wilayah (turf war), serta perekonomian hitam yang ketat.\n\nSejarah membuktikan sejak 2019 THB mendominasi block timur.'),
  ('about_fivem_title', 'Lore & Sejarah di GTA FiveM'),
  ('about_fivem_content', 'Di platform GTA FiveM yang modern dan realistis, kami membawa identitas The Hollow Northenwall (THN). Di sini, kami memprioritaskan kualitas roleplay yang mendalam (deep roleplay), interaksi karakter yang kompleks, serta pemanfaatan kostum kustom (MLO/clothing) untuk merepresentasikan budaya UK Drill modern secara nyata.'),
  ('discord_samp', 'https://discord.gg/xPPgZYxp'),
  ('tiktok_samp', 'https://www.tiktok.com/@hollow.samp?_r=1&_t=ZS-96kvkUfX2oR'),
  ('youtube_samp', 'https://youtube.com/@hollowsamp?si=QENhCHw3BT79xs6c'),
  ('instagram_samp', ''),
  ('discord_fivem', 'https://discord.gg/x5NCxdC52'),
  ('tiktok_fivem', ''),
  ('youtube_fivem', ''),
  ('instagram_fivem', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
