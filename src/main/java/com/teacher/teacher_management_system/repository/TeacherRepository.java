package com.teacher.teacher_management_system.repository;

import com.teacher.teacher_management_system.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, String> {

    boolean existsByDepartmentId(Integer departmentId);
}