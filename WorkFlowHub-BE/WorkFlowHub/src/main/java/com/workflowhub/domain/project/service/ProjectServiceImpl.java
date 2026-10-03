package com.workflowhub.domain.project.service;

import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.common.service.impl.BaseServiceImpl;
import com.workflowhub.domain.project.entity.Project;
import com.workflowhub.domain.project.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProjectServiceImpl
        extends BaseServiceImpl<Project, UUID, ProjectRepository>
        implements ProjectService {

    private static final RsqlSpecificationBuilder<Project> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(Project.class)
                    .build();

    public ProjectServiceImpl(ProjectRepository repository) {
        super(repository, "Project");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Project> getPage(String search, Pageable pageable) {
        Specification<Project> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable);
    }

    @Override
    public Project update(UUID id, Project project) {
        return null;
    }

}
