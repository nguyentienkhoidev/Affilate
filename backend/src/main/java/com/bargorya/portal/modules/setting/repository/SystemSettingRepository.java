package com.bargorya.portal.modules.setting.repository;

import com.bargorya.portal.modules.setting.entity.SystemSettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSettingEntity, Long> {
    Optional<SystemSettingEntity> findBySettingKey(String settingKey);
}
