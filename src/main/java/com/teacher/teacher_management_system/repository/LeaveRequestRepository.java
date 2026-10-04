package com.teacher.teacher_management_system.repository;

import com.teacher.teacher_management_system.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRequestRepository
        extends JpaRepository<LeaveRequest, Integer> {

    boolean existsByTeacherId(String teacherId);
}