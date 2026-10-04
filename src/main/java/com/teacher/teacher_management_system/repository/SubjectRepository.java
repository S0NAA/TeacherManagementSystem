package com.teacher.teacher_management_system.repository;

import com.teacher.teacher_management_system.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {

    boolean existsByDepartmentId(Integer departmentId);
}