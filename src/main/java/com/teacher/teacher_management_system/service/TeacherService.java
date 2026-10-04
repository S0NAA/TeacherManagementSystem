package com.teacher.teacher_management_system.service;

import com.teacher.teacher_management_system.entity.Teacher;
import com.teacher.teacher_management_system.repository.AttendanceRepository;
import com.teacher.teacher_management_system.repository.LeaveRequestRepository;
import com.teacher.teacher_management_system.repository.TeacherAssignmentRepository;
import com.teacher.teacher_management_system.repository.TeacherRepository;
import com.teacher.teacher_management_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final UserRepository userRepository;

    public TeacherService(
            TeacherRepository teacherRepository,
            AttendanceRepository attendanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            UserRepository userRepository) {

        this.teacherRepository = teacherRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.userRepository = userRepository;
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public Teacher getTeacherById(String teacherId) {

        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Teacher not found"
                ));
    }

    public Teacher addTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    public Teacher updateTeacher(
            String teacherId,
            Teacher updatedTeacher) {

        Teacher existingTeacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Teacher not found"
                ));

        existingTeacher.setName(updatedTeacher.getName());
        existingTeacher.setEmail(updatedTeacher.getEmail());
        existingTeacher.setPhone(updatedTeacher.getPhone());
        existingTeacher.setDepartmentId(updatedTeacher.getDepartmentId());
        existingTeacher.setStatus(updatedTeacher.getStatus());

        return teacherRepository.save(existingTeacher);
    }

    public void deleteTeacher(String teacherId) {

        if (!teacherRepository.existsById(teacherId)) {
            throw new IllegalArgumentException("Teacher not found");
        }

        if (attendanceRepository.existsByTeacherId(teacherId)) {
            throw new IllegalArgumentException(
                    "Cannot delete teacher because attendance records exist"
            );
        }

        if (leaveRequestRepository.existsByTeacherId(teacherId)) {
            throw new IllegalArgumentException(
                    "Cannot delete teacher because leave requests exist"
            );
        }

        if (teacherAssignmentRepository.existsByTeacherId(teacherId)) {
            throw new IllegalArgumentException(
                    "Cannot delete teacher because teacher assignments exist"
            );
        }

        if (userRepository.existsByTeacherId(teacherId)) {
            throw new IllegalArgumentException(
                    "Cannot delete teacher because a user account is linked"
            );
        }

        teacherRepository.deleteById(teacherId);
    }
}