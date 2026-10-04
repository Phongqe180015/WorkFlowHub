CREATE TABLE IF NOT EXISTS workflow.project_members (
     project_id INT NOT NULL REFERENCES workflow.projects(id) ON DELETE CASCADE,
     user_id INT NOT NULL REFERENCES workflow.users(id) ON DELETE CASCADE,
     role VARCHAR(100),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS workflow.comments (
      id SERIAL PRIMARY KEY,
      task_id INT NOT NULL REFERENCES workflow.tasks(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES workflow.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow.attachments (
     id SERIAL PRIMARY KEY,
     task_id INT NOT NULL REFERENCES workflow.tasks(id) ON DELETE CASCADE,
     file_url TEXT NOT NULL,
     file_name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow.notifications (
       id SERIAL PRIMARY KEY,
       user_id INT NOT NULL REFERENCES workflow.users(id) ON DELETE CASCADE,
       type VARCHAR(100) NOT NULL,
       content TEXT NOT NULL,
       is_read BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow.activity_logs (
       id SERIAL PRIMARY KEY,
       user_id INT NOT NULL REFERENCES workflow.users(id) ON DELETE CASCADE,
       project_id INT REFERENCES workflow.projects(id) ON DELETE CASCADE,
       action VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);