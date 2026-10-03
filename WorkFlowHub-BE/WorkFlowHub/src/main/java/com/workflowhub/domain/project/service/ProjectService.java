package com.workflowhub.domain.project.service;

import com.workflowhub.common.service.BaseService;
import com.workflowhub.domain.project.entity.Project;

import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface ProjectService extends BaseService<Project, UUID> {

    org.springframework.data.domain.Page<Project> getPage(String search, Pageable pageable);

    Project update(UUID id, Project project);
}
