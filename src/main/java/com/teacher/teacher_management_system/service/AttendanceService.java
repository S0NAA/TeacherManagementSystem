package com.teacher.teacher_management_system.service;

import com.teacher.teacher_management_system.entity.Attendance;
import com.teacher.teacher_management_system.repository.AttendanceRepository;
import com.teacher.teacher_management_system.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final TeacherRepository teacherRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            TeacherRepository teacherRepository) {

        this.attendanceRepository = attendanceRepository;
        this.teacherRepository = teacherRepository;
    }

    // =====================================================
    // GET ALL
    // =====================================================

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // =====================================================
    // ADD
    // =====================================================

    public Attendance addAttendance(Attendance attendance) {

        validateAttendance(attendance, null);

        return attendanceRepository.save(attendance);
    }

    // =====================================================
    // UPDATE
    // =====================================================

    public Attendance updateAttendance(
            Integer attendanceId,
            Attendance attendance) {

        Optional<Attendance> existing =
                attendanceRepository.findById(attendanceId);

        if (existing.isEmpty()) {

            throw new IllegalArgumentException(
                    "Attendance record not found."
            );
        }

        validateAttendance(
                attendance,
                attendanceId
        );

        Attendance updated = existing.get();

        updated.setTeacherId(
                attendance.getTeacherId()
        );

        updated.setAttendanceDate(
                attendance.getAttendanceDate()
        );

        updated.setStatus(
                attendance.getStatus()
        );

        updated.setRemarks(
                attendance.getRemarks()
        );

        return attendanceRepository.save(updated);
    }

    // =====================================================
    // DELETE
    // =====================================================

    public void deleteAttendance(Integer attendanceId) {

        if (!attendanceRepository.existsById(attendanceId)) {

            throw new IllegalArgumentException(
                    "Attendance record not found."
            );
        }

        attendanceRepository.deleteById(attendanceId);
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateAttendance(
            Attendance attendance,
            Integer currentAttendanceId) {

        // -------------------------------------------------
        // Teacher ID
        // -------------------------------------------------

        if (attendance.getTeacherId() == null ||
                attendance.getTeacherId().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Teacher ID is required."
            );
        }

        String teacherId =
                attendance.getTeacherId().trim();

        // -------------------------------------------------
        // Check teacher exists
        // -------------------------------------------------

        if (!teacherRepository.existsById(teacherId)) {

            throw new IllegalArgumentException(
                    "Teacher ID "
                            + teacherId
                            + " does not exist."
            );
        }

        // -------------------------------------------------
        // Attendance date
        // -------------------------------------------------

        if (attendance.getAttendanceDate() == null) {

            throw new IllegalArgumentException(
                    "Attendance date is required."
            );
        }

        // -------------------------------------------------
        // Status
        // -------------------------------------------------

        if (attendance.getStatus() == null ||
                attendance.getStatus().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Attendance status is required."
            );
        }

        String status =
                attendance.getStatus().trim();

        if (!status.equals("Present") &&
                !status.equals("Absent") &&
                !status.equals("Late")) {

            throw new IllegalArgumentException(
                    "Status must be Present, Absent, or Late."
            );
        }

        // -------------------------------------------------
        // Duplicate teacher + date
        // -------------------------------------------------

        Optional<Attendance> duplicate =
                attendanceRepository
                        .findByTeacherIdAndAttendanceDate(
                                teacherId,
                                attendance.getAttendanceDate()
                        );

        if (duplicate.isPresent()) {

            if (currentAttendanceId == null ||
                    !duplicate.get()
                            .getAttendanceId()
                            .equals(currentAttendanceId)) {

                throw new IllegalArgumentException(
                        "Attendance for teacher "
                                + teacherId
                                + " already exists for "
                                + attendance.getAttendanceDate()
                                + "."
                );
            }
        }

        // -------------------------------------------------
        // Save trimmed teacher ID
        // -------------------------------------------------

        attendance.setTeacherId(teacherId);
        attendance.setStatus(status);
    }
}
