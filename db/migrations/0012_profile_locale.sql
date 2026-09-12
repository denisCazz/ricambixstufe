-- Lingua preferita del fornitore/cliente per le email transazionali
-- psql "$DATABASE_URL" -f db/migrations/0012_profile_locale.sql

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'locale'
  ) THEN
    ALTER TABLE profiles ADD COLUMN locale TEXT NOT NULL DEFAULT 'it';

    UPDATE profiles SET locale = 'fr' WHERE country IN ('FR', 'MC', 'BE', 'LU');
    UPDATE profiles SET locale = 'es' WHERE country IN ('ES', 'AD');
    UPDATE profiles SET locale = 'en'
    WHERE country IS NOT NULL
      AND country NOT IN ('IT', 'SM', 'VA', 'FR', 'MC', 'BE', 'LU', 'ES', 'AD');
  END IF;
END $$;
