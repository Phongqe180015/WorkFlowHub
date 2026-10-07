CREATE TABLE workflow.subtasks (
       id BIGSERIAL PRIMARY KEY,
       task_id BIGINT NOT NULL REFERENCES workflow.tasks(id) ON DELETE CASCADE,
       title VARCHAR(255) NOT NULL,
       description VARCHAR(400),
       is_completed BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);