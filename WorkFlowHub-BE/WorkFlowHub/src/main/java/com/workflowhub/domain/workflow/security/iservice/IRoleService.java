package com.workflowhub.domain.workflow.security.iservice;

import com.workflowhub.domain.workflow.security.dto.request.CreateRoleRequest;
import com.workflowhub.domain.workflow.security.dto.request.UpdateRoleRequest;
import com.workflowhub.domain.workflow.security.dto.response.RoleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IRoleService {

    Page<RoleResponse> getPage(String search, Pageable pageable);

    RoleResponse getRoleById(Long id);

    RoleResponse createRole(CreateRoleRequest request);

    RoleResponse updateRole(Long id, UpdateRoleRequest request);

    void deleteRole(Long id);
}
