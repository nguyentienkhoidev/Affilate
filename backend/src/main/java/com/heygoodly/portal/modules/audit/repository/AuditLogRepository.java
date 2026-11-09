package com.heygoodly.portal.modules.audit.repository;

import com.heygoodly.portal.modules.audit.entity.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long>, JpaSpecificationExecutor<AuditLogEntity> {

    @Query("SELECT a FROM AuditLogEntity a WHERE "
            + "(:action IS NULL OR LOWER(a.action) = LOWER(:action)) AND "
            + "(:module IS NULL OR LOWER(a.module) = LOWER(:module)) AND "
            + "(:userEmail IS NULL OR LOWER(a.userEmail) = LOWER(:userEmail)) AND "
            + "(:startDate IS NULL OR a.createdAt >= :startDate) AND "
            + "(:endDate IS NULL OR a.createdAt <= :endDate) AND "
            + "(:search IS NULL OR ("
            + "   LOWER(a.resourceName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "   LOWER(a.resourceId) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "   LOWER(a.userEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "   LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "   LOWER(a.module) LIKE LOWER(CONCAT('%', :search, '%'))"
            + "))")
    Page<AuditLogEntity> searchAuditLogs(
            @Param("action") String action,
            @Param("module") String module,
            @Param("userEmail") String userEmail,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCreatedAtGreaterThanEqual(Instant since);

    @Query("SELECT a FROM AuditLogEntity a WHERE "
            + "(:userEmail IS NOT NULL AND LOWER(a.userEmail) = LOWER(:userEmail)) "
            + "OR (:userId IS NOT NULL AND a.userId = :userId) "
            + "ORDER BY a.createdAt DESC")
    java.util.List<AuditLogEntity> findByUserActivity(
            @Param("userEmail") String userEmail,
            @Param("userId") Long userId,
            Pageable pageable
    );

    @Query("SELECT a FROM AuditLogEntity a WHERE "
            + "((:userEmail IS NOT NULL AND LOWER(a.userEmail) = LOWER(:userEmail)) "
            + " OR (:userId IS NOT NULL AND a.userId = :userId)) AND "
            + "(:type IS NULL OR :type = '' OR :type = 'ALL' OR "
            + "   (:type = 'LOGIN' AND (LOWER(a.action) LIKE '%login%' OR LOWER(a.action) LIKE '%auth%' OR LOWER(a.module) = 'auth')) OR "
            + "   (:type = '2FA' AND (LOWER(a.action) LIKE '%2fa%' OR LOWER(a.action) LIKE '%totp%' OR LOWER(a.action) LIKE '%recovery%')) OR "
            + "   (:type = 'PASSWORD' AND LOWER(a.action) LIKE '%password%') OR "
            + "   (:type = 'PROFILE' AND LOWER(a.action) LIKE '%profile%') OR "
            + "   (:type = 'RBAC' AND (LOWER(a.action) LIKE '%role%' OR LOWER(a.module) LIKE '%role%' OR LOWER(a.action) LIKE '%permission%')) OR "
            + "   (LOWER(a.action) LIKE LOWER(CONCAT('%', :type, '%')) OR LOWER(a.module) LIKE LOWER(CONCAT('%', :type, '%')))) AND "
            + "(:search IS NULL OR :search = '' OR ("
            + "   LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "   LOWER(a.resourceName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "   LOWER(a.ipAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "   LOWER(a.device) LIKE LOWER(CONCAT('%', :search, '%')))) "
            + "ORDER BY a.createdAt DESC")
    java.util.List<AuditLogEntity> findByUserActivityFiltered(
            @Param("userEmail") String userEmail,
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT COUNT(a) FROM AuditLogEntity a WHERE LOWER(a.action) LIKE '%delete%' OR LOWER(a.action) LIKE '%rbac%' OR LOWER(a.action) LIKE '%security%' OR LOWER(a.action) LIKE '%lock%'")
    long countSensitiveActions();

    @Query("SELECT COUNT(DISTINCT a.userEmail) FROM AuditLogEntity a WHERE a.userEmail IS NOT NULL AND a.userEmail <> ''")
    long countDistinctOperators();

    @Query("SELECT DISTINCT a.action FROM AuditLogEntity a WHERE a.action IS NOT NULL ORDER BY a.action ASC")
    java.util.List<String> findDistinctActions();

    @Query("SELECT DISTINCT a.module FROM AuditLogEntity a WHERE a.module IS NOT NULL ORDER BY a.module ASC")
    java.util.List<String> findDistinctModules();

    @Query("SELECT DISTINCT a.userEmail FROM AuditLogEntity a WHERE a.userEmail IS NOT NULL AND a.userEmail <> '' ORDER BY a.userEmail ASC")
    java.util.List<String> findDistinctUserEmails();
}

