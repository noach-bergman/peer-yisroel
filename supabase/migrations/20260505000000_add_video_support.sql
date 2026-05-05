ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
