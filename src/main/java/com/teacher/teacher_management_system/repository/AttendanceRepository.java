package com.teacher.teacher_management_system.repository;

import com.teacher.teacher_management_system.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Integer> {

    Optional<Attendance> findByTeacherIdAndAttendanceDate(
            String teacherId,
            LocalDate attendanceDate
    );

    boolean existsByTeacherId(String teacherId);
}