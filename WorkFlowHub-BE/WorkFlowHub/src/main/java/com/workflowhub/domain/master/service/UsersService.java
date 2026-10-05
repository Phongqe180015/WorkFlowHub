package com.workflowhub.domain.master.service;

import com.workflowhub.common.exception.ConflictException;
import com.workflowhub.common.exception.NotFoundException;
import com.workflowhub.common.rsql.RsqlSpecificationBuilder;
import com.workflowhub.domain.master.dto.request.CreateUserRequest;
import com.workflowhub.domain.master.dto.request.UpdateUserRequest;
import com.workflowhub.domain.master.dto.response.UserResponse;
import com.workflowhub.domain.master.entity.UsersEntity;
import com.workflowhub.domain.master.irepository.IUsersRepository;
import com.workflowhub.domain.master.iservice.IUsersService;
import com.workflowhub.domain.master.mapper.IUsersMapper;
import com.workflowhub.domain.workflow.security.entity.RoleEntity;
import com.workflowhub.domain.workflow.security.irepository.IRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.workflowhub.common.constant.MessageConstants.EMAIL_ALREADY_EXISTS;
import static com.workflowhub.common.constant.MessageConstants.USER;

@Service
@RequiredArgsConstructor
public class UsersService implements IUsersService {

    private static final RsqlSpecificationBuilder<UsersEntity> RSQL_BUILDER =
            RsqlSpecificationBuilder.forEntity(UsersEntity.class, "password")
                    .build();

    private final IUsersRepository repository;
    private final IUsersMapper usersMapper;
    private final PasswordEncoder passwordEncoder;
    private final IRoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getPage(String search, Pageable pageable) {
        Specification<UsersEntity> spec = RSQL_BUILDER.parse(search);
        return repository.findAll(spec, pageable).map(usersMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        UsersEntity entity = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(USER, id));
        return usersMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (repository.existsByEmail(request.getEmail())) {
            throw new ConflictException(EMAIL_ALREADY_EXISTS + request.getEmail());
        }
        RoleEntity roleEntity = roleRepository.getByName(USER)
                .orElseThrow(() -> NotFoundException.of(USER, null));

        UsersEntity entity = usersMapper.toEntity(request, roleEntity.getId());
        entity.setPassword(passwordEncoder.encode(request.getPassword()));
        UsersEntity saved = repository.save(entity);
        return usersMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        UsersEntity existing = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of(USER, id));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(existing.getEmail())) {
            if (repository.existsByEmail(request.getEmail())) {
                throw new ConflictException(EMAIL_ALREADY_EXISTS + request.getEmail());
            }
        }

        usersMapper.updateEntityFromRequest(request, existing);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        UsersEntity saved = repository.save(existing);
        return usersMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(USER, id);
        }
        repository.deleteById(id);
    }
}
