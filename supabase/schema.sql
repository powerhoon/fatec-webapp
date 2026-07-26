-- Fatec System Homepage - Supabase Schema
-- Run this in Supabase SQL Editor after creating project

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL CHECK (brand IN ('DEPRAG', 'WITTENSTEIN alpha', 'Fatec System')),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  specs JSONB DEFAULT '{}',
  featured_image TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);

-- 2. Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source TEXT DEFAULT 'fatec-homepage',
  verified BOOLEAN DEFAULT false,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- 3. Technical documents (PDF metadata)
CREATE TABLE IF NOT EXISTS technical_documents (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE technical_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON technical_documents FOR SELECT USING (true);

-- 4. Contact inquiries
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Storage buckets (create via Supabase dashboard or CLI)
-- 1. technical-docs (public read)
-- 2. product-images (public read)
-- 3. blog-media (public read)

-- Download count RPC
CREATE OR REPLACE FUNCTION increment_download_count(doc_id BIGINT)
RETURNS INTEGER AS $$
  UPDATE technical_documents SET download_count = download_count + 1 WHERE id = doc_id RETURNING download_count;
$$ LANGUAGE sql SECURITY DEFINER;