package com.workflowhub.domain.workflow.security.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.security.entity.RoleEntity;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IRoleRepository extends BaseRepository<RoleEntity, Long> {

    Optional<RoleEntity> findByName(String name);

    boolean existsByName(String name);

    Optional<RoleEntity> getByName(String role);
}
