CREATE TABLE IF NOT EXISTS workflow.tasks (
       id SERIAL PRIMARY KEY,
       project_id INT NOT NULL REFERENCES workflow.projects(id) ON DELETE CASCADE,
       assignee_id INT REFERENCES workflow.users(id) ON DELETE SET NULL,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       priority VARCHAR(50),
       status VARCHAR(50) DEFAULT 'pending',
       due_date DATE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);