package com.heygoodly.portal.modules.store.repository;

import com.heygoodly.portal.modules.store.entity.ReviewerProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ReviewerProfileRepository extends JpaRepository<ReviewerProfileEntity, Long> {

    List<ReviewerProfileEntity> findTop20ByIsDeletedFalseOrderByUpdatedAtDescIdDesc();

    List<ReviewerProfileEntity> findTop20ByIsDeletedFalseAndNameContainingIgnoreCaseOrderByNameAsc(String search);

    @Query("SELECT r FROM ReviewerProfileEntity r WHERE r.isDeleted = false AND LOWER(r.name) IN :lowerNames")
    List<ReviewerProfileEntity> findByLowerNames(@Param("lowerNames") Collection<String> lowerNames);
}
