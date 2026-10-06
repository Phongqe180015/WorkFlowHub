ALTER TABLE workflow.tasks ADD COLUMN sprint_id INT NULL,
ADD CONSTRAINT fk_workflow_task_workflow_sprint FOREIGN KEY (sprint_id) REFERENCES workflow.sprints(id)
    ON DELETE SET NULL;