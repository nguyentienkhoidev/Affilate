package com.bargorya.portal.modules.menu.repository;

import com.bargorya.portal.modules.menu.entity.MenuEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<MenuEntity, Long> {
    List<MenuEntity> findByPositionAndIsActiveTrueOrderBySortOrderAsc(String position);
    List<MenuEntity> findByPositionOrderBySortOrderAsc(String position);
}
