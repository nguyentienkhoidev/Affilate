package com.heygoodly.portal.modules.user.repository;

import com.heygoodly.portal.modules.user.entity.UserLoginRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserLoginRecordRepository extends JpaRepository<UserLoginRecordEntity, Long> {

    List<UserLoginRecordEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("DELETE FROM UserLoginRecordEntity r WHERE r.userId = :userId AND r.id = :id")
    void deleteByUserIdAndId(@Param("userId") Long userId, @Param("id") Long id);

    @Modifying
    @Query("DELETE FROM UserLoginRecordEntity r WHERE r.userId = :userId AND r.id <> :currentId")
    void deleteByUserIdAndIdNot(@Param("userId") Long userId, @Param("currentId") Long currentId);

    @Modifying
    @Query("DELETE FROM UserLoginRecordEntity r WHERE r.userId = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}

