package com.bargorya.portal.modules.role.repository;

import com.bargorya.portal.modules.role.entity.RoleEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    Optional<RoleEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"permissions"})
    Optional<RoleEntity> findWithPermissionsById(Long id);
}
