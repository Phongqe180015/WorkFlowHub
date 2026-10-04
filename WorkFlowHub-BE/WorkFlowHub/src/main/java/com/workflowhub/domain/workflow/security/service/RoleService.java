package com.workflowhub.domain.workflow.security.service;

import com.workflowhub.common.exception.ConflictException;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.workflow.security.dto.request.CreateRoleRequest;
import com.workflowhub.domain.workflow.security.dto.request.UpdateRoleRequest;
import com.workflowhub.domain.workflow.security.dto.response.RoleResponse;
import com.workflowhub.domain.workflow.security.entity.RoleEntity;
import com.workflowhub.domain.workflow.security.irepository.IRoleRepository;
import com.workflowhub.domain.workflow.security.iservice.IRoleService;
import com.workflowhub.domain.workflow.security.mapper.IRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleService implements IRoleService {

    private static final RsqlSpecificationBuilder<RoleEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(RoleEntity.class)
                    .field("name", "name", String.class)
                    .build();

    public static final String ROLE = "Role";

    private final IRoleRepository repository;
    private final IRoleMapper roleMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<RoleResponse> getPage(String search, Pageable pageable) {
        Specification<RoleEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(roleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        RoleEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(ROLE, id));
        return roleMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        if (repository.existsByName(request.getName())) {
            throw new ConflictException("Role already exists with name: " + request.getName());
        }
        RoleEntity entity = roleMapper.toEntity(request);
        RoleEntity saved = repository.save(entity);
        return roleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, UpdateRoleRequest request) {
        RoleEntity existing = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(ROLE, id));

        if (request.getName() != null && !request.getName().equalsIgnoreCase(existing.getName())) {
            if (repository.existsByName(request.getName())) {
                throw new ConflictException("Role already exists with name: " + request.getName());
            }
        }

        roleMapper.updateEntityFromRequest(request, existing);
        RoleEntity saved = repository.save(existing);
        return roleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(ROLE, id);
        }
        repository.deleteById(id);
    }
}
