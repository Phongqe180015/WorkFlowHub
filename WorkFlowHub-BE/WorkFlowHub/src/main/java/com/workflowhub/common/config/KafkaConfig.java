package com.workflowhub.common.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.TopicBuilder;

@EnableKafka
@Configuration
public class KafkaConfig {

    public static final String TASK_EVENTS_TOPIC = "task-events";

    @Bean
    public NewTopic taskEventsTopic() {
        return TopicBuilder.name(TASK_EVENTS_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
