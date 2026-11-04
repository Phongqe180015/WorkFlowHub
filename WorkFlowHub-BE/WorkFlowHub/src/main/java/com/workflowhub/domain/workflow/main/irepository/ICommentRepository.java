package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.CommentEntity;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ICommentRepository extends BaseRepository<CommentEntity, Long> {

    List<CommentEntity> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    List<CommentEntity> findBySubtaskIdOrderByCreatedAtAsc(Long subtaskId);
}
