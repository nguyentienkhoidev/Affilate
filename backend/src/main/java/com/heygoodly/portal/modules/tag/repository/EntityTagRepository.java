package com.heygoodly.portal.modules.tag.repository;

import com.heygoodly.portal.modules.tag.entity.EntityTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntityTagRepository extends JpaRepository<EntityTagEntity, Long> {

    List<EntityTagEntity> findByEntityTypeAndEntityId(String entityType, Long entityId);

    List<EntityTagEntity> findByTagId(Long tagId);

    @Modifying
    @Query("DELETE FROM EntityTagEntity et WHERE et.entityType = :entityType AND et.entityId = :entityId")
    void deleteByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") Long entityId);

    @Query("SELECT et.tagId, et.entityType, count(et) FROM EntityTagEntity et GROUP BY et.tagId, et.entityType")
    List<Object[]> countGroupedByTagAndEntityType();

    @Query("SELECT et.entityId FROM EntityTagEntity et WHERE et.tagId = :tagId AND et.entityType = :entityType")
    List<Long> findEntityIdsByTagIdAndEntityType(@Param("tagId") Long tagId, @Param("entityType") String entityType);

    @Query("SELECT DISTINCT et.entityId FROM EntityTagEntity et WHERE et.tagId IN :tagIds AND et.entityType = :entityType")
    List<Long> findEntityIdsByTagIdInAndEntityType(@Param("tagIds") java.util.Collection<Long> tagIds, @Param("entityType") String entityType);
}

