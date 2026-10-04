package com.teacher.teacher_management_system.repository;

import com.teacher.teacher_management_system.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassRepository extends JpaRepository<ClassEntity, Integer> {

    boolean existsByDepartmentId(Integer departmentId);
}