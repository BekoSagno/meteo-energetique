-- Migration : ajout communes + commune_id sur sectors (sans perte de données)
CREATE TABLE IF NOT EXISTS communes (
    id SERIAL PRIMARY KEY,
    region_id INT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_commune_per_region UNIQUE (region_id, name)
);

ALTER TABLE sectors ADD COLUMN IF NOT EXISTS commune_id INT;

-- Communes de Conakry (region_id = 1)
INSERT INTO communes (region_id, name)
SELECT 1, v.name
FROM (VALUES
    ('Kaloum'), ('Dixinn'), ('Ratoma'), ('Matam'), ('Matoto'), ('Gbessia')
) AS v(name)
WHERE EXISTS (SELECT 1 FROM regions WHERE id = 1)
ON CONFLICT (region_id, name) DO NOTHING;

-- Rattachement des anciens secteurs (noms historiques du seed v1)
UPDATE sectors s SET commune_id = c.id
FROM communes c
WHERE s.commune_id IS NULL
  AND c.region_id = s.region_id
  AND (
    (s.name = 'Kaloum' AND c.name = 'Kaloum')
    OR (s.name = 'Dixinn' AND c.name = 'Dixinn')
    OR (s.name IN ('Kipé', 'Lambanyi') AND c.name = 'Ratoma')
  );

-- Contrainte FK + NOT NULL (après backfill)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sectors_commune_id_fkey'
  ) THEN
    ALTER TABLE sectors
      ADD CONSTRAINT sectors_commune_id_fkey
      FOREIGN KEY (commune_id) REFERENCES communes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Secteurs sans commune : Dixinn par défaut
UPDATE sectors s SET commune_id = c.id
FROM communes c
WHERE s.commune_id IS NULL AND c.name = 'Dixinn' AND c.region_id = s.region_id;

ALTER TABLE sectors ALTER COLUMN commune_id SET NOT NULL;

-- Ancienne contrainte unique par région
ALTER TABLE sectors DROP CONSTRAINT IF EXISTS unique_sector_per_region;

-- Nouvelle contrainte unique par commune
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_sector_per_commune'
  ) THEN
    ALTER TABLE sectors ADD CONSTRAINT unique_sector_per_commune UNIQUE (commune_id, name);
  END IF;
END $$;
