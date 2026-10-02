-- V1__baseline.sql
-- ============================================================
-- Flyway baseline migration for WorkFlowHub.
--
-- The common package does not create any tables. All tables
-- are owned by their respective business modules (user, project,
-- task, etc.) via subsequent migrations (V2__, V3__, ...).
--
-- This file exists so that Flyway has a stable baseline to
-- checksum against before any module-specific migrations run.
-- ============================================================

-- Enable pgcrypto for UUID generation (used by PostgreSQL as fallback)
-- Note: Hibernate 6 generates UUIDs at the Java level, so this is optional
-- but good to have for direct SQL inserts during testing.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable uuid-ossp as alternative
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
