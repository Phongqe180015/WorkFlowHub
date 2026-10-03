package com.workflowhub.domain.workflow.security.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.security.entity.UsersEntity;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUsersRepository extends BaseRepository<UsersEntity, Long> {

    Optional<UsersEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}
