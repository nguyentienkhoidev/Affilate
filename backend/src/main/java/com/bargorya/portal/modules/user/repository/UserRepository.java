package com.bargorya.portal.modules.user.repository;

import com.bargorya.portal.modules.user.entity.UserEntity;
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
}
