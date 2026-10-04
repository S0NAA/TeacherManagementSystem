package com.teacher.teacher_management_system.repository;

import com.teacher.teacher_management_system.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeacherAssignmentRepository
        extends JpaRepository<TeacherAssignment, Integer> {

    Optional<TeacherAssignment> findByTeacherIdAndSubjectIdAndClassId(
            String teacherId,
            Integer subjectId,
            Integer classId
    );

    boolean existsByTeacherId(String teacherId);

    boolean existsBySubjectId(Integer subjectId);

    boolean existsByClassId(Integer classId);
}