package com.workflowhub.domain.workflow.security.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.workflowhub.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users", schema = "workflow")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsersEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "avatar", columnDefinition = "TEXT")
    private String avatar;

    @Column(name = "status", length = 50)
    private String status = "active";
}
