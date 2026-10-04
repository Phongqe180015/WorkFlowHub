package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.CommentEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface ICommentRepository extends BaseRepository<CommentEntity, Long> {
}
