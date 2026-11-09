package com.heygoodly.portal.modules.role.repository;

import com.heygoodly.portal.modules.role.entity.PermissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PermissionRepository extends JpaRepository<PermissionEntity, Long> {
    Optional<PermissionEntity> findByCode(String code);
    List<PermissionEntity> findByCodeIn(Set<String> codes);
}
