package com.teacher.teacher_management_system.service;

import com.teacher.teacher_management_system.entity.TeacherAssignment;
import com.teacher.teacher_management_system.repository.TeacherAssignmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherAssignmentService {

    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public TeacherAssignmentService(
            TeacherAssignmentRepository teacherAssignmentRepository) {

        this.teacherAssignmentRepository =
                teacherAssignmentRepository;
    }

    // GET ALL
    public List<TeacherAssignment> getAllAssignments() {
        return teacherAssignmentRepository.findAll();
    }

    // ADD
    public TeacherAssignment addAssignment(
            TeacherAssignment assignment) {

        validateAssignment(assignment, null);

        return teacherAssignmentRepository.save(assignment);
    }

    // UPDATE
    public TeacherAssignment updateAssignment(
            Integer assignmentId,
            TeacherAssignment assignment) {

        Optional<TeacherAssignment> existing =
                teacherAssignmentRepository.findById(assignmentId);

        if (existing.isEmpty()) {
            throw new IllegalArgumentException(
                    "Assignment record not found."
            );
        }

        assignment.setAssignmentId(assignmentId);

        validateAssignment(assignment, assignmentId);

        TeacherAssignment updated = existing.get();

        updated.setTeacherId(
                assignment.getTeacherId()
        );

        updated.setSubjectId(
                assignment.getSubjectId()
        );

        updated.setClassId(
                assignment.getClassId()
        );

        updated.setAcademicYear(
                assignment.getAcademicYear()
        );

        updated.setStatus(
                assignment.getStatus()
        );

        return teacherAssignmentRepository.save(updated);
    }

    // DELETE
    public void deleteAssignment(Integer assignmentId) {

        if (!teacherAssignmentRepository
                .existsById(assignmentId)) {

            throw new IllegalArgumentException(
                    "Assignment record not found."
            );
        }

        teacherAssignmentRepository.deleteById(
                assignmentId
        );
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateAssignment(
            TeacherAssignment assignment,
            Integer currentAssignmentId) {

        // Teacher validation
        if (assignment.getTeacherId() == null ||
                assignment.getTeacherId().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Teacher ID is required."
            );
        }

        // Subject validation
        if (assignment.getSubjectId() == null) {

            throw new IllegalArgumentException(
                    "Subject ID is required."
            );
        }

        // Class validation
        if (assignment.getClassId() == null) {

            throw new IllegalArgumentException(
                    "Class ID is required."
            );
        }

        // Academic year validation
        if (assignment.getAcademicYear() == null ||
                assignment.getAcademicYear().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Academic year is required."
            );
        }

        // Duplicate assignment check
        Optional<TeacherAssignment> duplicate =
                teacherAssignmentRepository
                        .findByTeacherIdAndSubjectIdAndClassId(
                                assignment.getTeacherId(),
                                assignment.getSubjectId(),
                                assignment.getClassId()
                        );

        if (duplicate.isPresent()) {

            if (currentAssignmentId == null ||
                    !duplicate.get()
                            .getAssignmentId()
                            .equals(currentAssignmentId)) {

                throw new IllegalArgumentException(
                        "This teacher is already assigned "
                                + "to this subject and class."
                );
            }
        }
    }
}
