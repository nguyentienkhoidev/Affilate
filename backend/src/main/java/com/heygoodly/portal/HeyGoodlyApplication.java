package com.heygoodly.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@EnableJpaAuditing
@SpringBootApplication
public class HeyGoodlyApplication {

    public static void main(String[] args) {
        SpringApplication.run(HeyGoodlyApplication.class, args);
    }
}
