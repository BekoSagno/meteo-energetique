-- Renomme la colonne créée par prisma db push (userLocation) → user_location (snake_case API).
ALTER TABLE user_reports RENAME COLUMN "userLocation" TO user_location;

CREATE INDEX IF NOT EXISTS idx_user_reports_geo ON user_reports USING GIST (user_location);
