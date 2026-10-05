-- 1. Insert default roles if not exist (including ADMIN)
INSERT INTO workflow.roles (name) VALUES 
('ADMIN'),
('User'),
('PROJECT_MANAGER'),
('DEVELOPER'),
('TESTER'),
('VIEWER')
ON CONFLICT (name) DO NOTHING;

-- 2. Add role_id foreign key to workflow.users
ALTER TABLE workflow.users 
ADD COLUMN IF NOT EXISTS role_id INT REFERENCES workflow.roles(id) ON DELETE SET NULL;

-- 3. Add role_id foreign key to workflow.project_members
ALTER TABLE workflow.project_members 
ADD COLUMN IF NOT EXISTS role_id INT REFERENCES workflow.roles(id) ON DELETE SET NULL;

-- Drop old text role column from project_members
ALTER TABLE workflow.project_members DROP COLUMN IF EXISTS role;
