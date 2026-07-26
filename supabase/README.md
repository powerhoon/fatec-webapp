# Supabase Setup Guide

## 1. Create Project
1. Go to https://supabase.com and create a new project
2. Note your **Project URL** and **anon key** from Settings → API

## 2. Run Schema
1. Open SQL Editor in Supabase Dashboard
2. Copy and paste `schema.sql`
3. Run all statements

## 3. Create Storage Buckets
In Supabase Dashboard → Storage:
- `technical-docs` (public)
- `product-images` (public)  
- `blog-media` (public)

## 4. Configure Netlify Environment Variables
| Variable | Value |
|----------|-------|
| SUPABASE_URL | https://your-project.supabase.co |
| SUPABASE_ANON_KEY | your-anon-key |

## 5. Verify
- Visit your site and check js/supabase-client.js loads
- The newsletter form submits to Supabase