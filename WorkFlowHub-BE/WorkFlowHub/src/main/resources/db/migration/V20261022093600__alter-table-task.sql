
ALTER TABLE workflow.tasks
    ADD COLUMN IF NOT EXISTS deleted_by_id BIGINT REFERENCES workflow.users(id);