package com.workflowhub.domain.workflow.security.iservice;

import com.workflowhub.domain.workflow.security.dto.request.CreateUserRequest;
import com.workflowhub.domain.workflow.security.dto.request.UpdateUserRequest;
import com.workflowhub.domain.workflow.security.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IUsersService {

    Page<UserResponse> getPage(String search, Pageable pageable);

    UserResponse getUserById(Long id);

    UserResponse createUser(CreateUserRequest request);

    UserResponse updateUser(Long id, UpdateUserRequest request);

    void deleteUser(Long id);
}
