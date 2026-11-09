package com.heygoodly.portal.common.i18n.repository;

import com.heygoodly.portal.common.i18n.entity.I18nMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface I18nMessageRepository extends JpaRepository<I18nMessageEntity, Long> {

    Optional<I18nMessageEntity> findByMessageKey(String messageKey);

    Optional<I18nMessageEntity> findByMessageEnIgnoreCase(String messageEn);
}

