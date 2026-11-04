-- Add subtask_id column to comments table to support comments on subtasks
-- task_id is now nullable (a comment belongs to EITHER a task or a subtask)
ALTER TABLE workflow.comments
    ALTER COLUMN task_id DROP NOT NULL;

ALTER TABLE workflow.comments
    ADD COLUMN IF NOT EXISTS subtask_id BIGINT NULL REFERENCES workflow.subtasks(id) ON DELETE CASCADE;

-- Add check constraint: comment must belong to either task or subtask
ALTER TABLE workflow.comments
    ADD CONSTRAINT chk_comment_has_target
    CHECK (task_id IS NOT NULL OR subtask_id IS NOT NULL);
