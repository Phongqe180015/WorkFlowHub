package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.AttachmentEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface IAttachmentRepository extends BaseRepository<AttachmentEntity, Long> {
}
