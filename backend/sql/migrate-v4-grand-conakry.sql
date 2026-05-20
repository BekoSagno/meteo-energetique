-- Migration vers hiérarchie Région → Commune → Quartier → Secteur

CREATE TABLE IF NOT EXISTS quartiers (
    id SERIAL PRIMARY KEY,
    commune_id INT NOT NULL REFERENCES communes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_quartier_per_commune UNIQUE (commune_id, name)
);

ALTER TABLE sectors ADD COLUMN IF NOT EXISTS quartier_id INT;

ALTER TABLE sectors DROP CONSTRAINT IF EXISTS unique_sector_per_commune;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sectors_quartier_id_fkey') THEN
    ALTER TABLE sectors
      ADD CONSTRAINT sectors_quartier_id_fkey
      FOREIGN KEY (quartier_id) REFERENCES quartiers(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_sector_per_quartier') THEN
    ALTER TABLE sectors ADD CONSTRAINT unique_sector_per_quartier UNIQUE (quartier_id, name);
  END IF;
END $$;
