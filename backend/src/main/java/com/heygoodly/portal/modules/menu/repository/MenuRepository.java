package com.heygoodly.portal.modules.menu.repository;

import com.heygoodly.portal.modules.menu.entity.MenuEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<MenuEntity, Long> {
    List<MenuEntity> findByPositionAndIsActiveTrueOrderBySortOrderAsc(String position);
    List<MenuEntity> findByPositionOrderBySortOrderAsc(String position);
    Page<MenuEntity> findByPositionOrderBySortOrderAsc(String position, Pageable pageable);
}
