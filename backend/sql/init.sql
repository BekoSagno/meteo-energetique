-- Schéma de référence Météo Énergétique (PostgreSQL + PostGIS)
-- À exécuter une fois si la base est vide, ou laisser Prisma migrate gérer l'état.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_sector_per_region UNIQUE (region_id, name)
);

CREATE INDEX idx_sectors_boundary ON sectors USING GIST (boundary);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'citizen',
    default_sector_id INT REFERENCES sectors(id) ON DELETE SET NULL,
    fcm_token TEXT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE iot_kits (
    id VARCHAR(50) PRIMARY KEY,
    sector_id INT REFERENCES sectors(id) ON DELETE CASCADE,
    location_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_ping TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE power_status (
    sector_id INT PRIMARY KEY REFERENCES sectors(id) ON DELETE CASCADE,
    current_state VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estimated_return_time TIMESTAMP WITH TIME ZONE NULL,
    confidence_score INT DEFAULT 100
);

CREATE TABLE power_logs (
    id BIGSERIAL PRIMARY KEY,
    sector_id INT REFERENCES sectors(id) ON DELETE CASCADE,
    kit_id VARCHAR(50) REFERENCES iot_kits(id) ON DELETE SET NULL,
    state_changed_to VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_power_logs_sector_time ON power_logs (sector_id, changed_at DESC);

CREATE TABLE user_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    sector_id INT REFERENCES sectors(id) ON DELETE CASCADE,
    report_type VARCHAR(30) NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_location GEOMETRY(Point, 4326) NULL
);

CREATE INDEX idx_user_reports_geo ON user_reports USING GIST (user_location);
CREATE INDEX idx_user_reports_time ON user_reports (reported_at DESC);
