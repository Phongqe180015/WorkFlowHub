package com.workflowhub.domain.workflow.main.irepository;

import com.workflowhub.common.repository.BaseRepository;
import com.workflowhub.domain.workflow.main.entity.TaskEntity;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ITaskRepository extends BaseRepository<TaskEntity, Long> {

    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.assignee.id = :userId AND t.isDeleted = false")
    long countAssignedTasks(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.assignee.id = :userId AND t.dueDate < :today AND t.status <> 'completed' AND t.isDeleted = false")
    long countOverdueTasks(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT t.status, COUNT(t) FROM TaskEntity t WHERE t.assignee.id = :userId AND t.isDeleted = false GROUP BY t.status")
    List<Object[]> countTasksByStatusForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.project.id = :projectId AND t.isDeleted = false")
    long countTasksByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.project.id = :projectId AND LOWER(t.status) = 'completed' AND t.isDeleted = false")
    long countCompletedTasksByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM TaskEntity t WHERE t.project.id = :projectId AND t.dueDate < :today AND LOWER(t.status) <> 'completed' AND t.isDeleted = false")
    long countOverdueTasksByProjectId(@Param("projectId") Long projectId, @Param("today") LocalDate today);

    @Query("SELECT t.status, COUNT(t) FROM TaskEntity t WHERE t.project.id = :projectId AND t.isDeleted = false GROUP BY t.status")
    List<Object[]> countTasksByStatusForProject(@Param("projectId") Long projectId);

    @Modifying
    @Query("DELETE FROM TaskEntity t WHERE t.project.id = :projectId AND t.isDeleted = true AND t.deletedBy.id = :userId")
    int deleteAllTrashTasksByProjectAndUser(@Param("projectId") Long projectId, @Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM TaskEntity t WHERE t.project.id = :projectId AND t.isDeleted = true")
    int deleteAllTrashTasksByProject(@Param("projectId") Long projectId);
}
