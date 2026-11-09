package com.heygoodly.portal.modules.user.repository;

import com.heygoodly.portal.modules.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long>, JpaSpecificationExecutor<UserEntity> {
    Optional<UserEntity> findByEmailAndIsDeletedFalse(String email);
    boolean existsByEmailAndIsDeletedFalse(String email);
    boolean existsByEmailAndIdNotAndIsDeletedFalse(String email, Long id);
    long countByRoleIdAndIsDeletedFalse(Long roleId);
    long countByIsDeletedFalse();

    @org.springframework.data.jpa.repository.Query("SELECT u.role.id, COUNT(u.id) FROM UserEntity u WHERE u.isDeleted = false AND u.role.id IN :roleIds GROUP BY u.role.id")
    java.util.List<Object[]> countUsersByRoleIds(@org.springframework.data.repository.query.Param("roleIds") java.util.Set<Long> roleIds);
}
