package com.teacher.teacher_management_system.controller;

import com.teacher.teacher_management_system.entity.Attendance;
import com.teacher.teacher_management_system.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public List<Attendance> getAllAttendance() {

        return attendanceService.getAllAttendance();
    }

    // =====================================================
    // ADD
    // =====================================================

    @PostMapping
    public ResponseEntity<?> addAttendance(
            @RequestBody Attendance attendance) {

        try {

            Attendance saved =
                    attendanceService.addAttendance(
                            attendance
                    );

            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Integer id,
            @RequestBody Attendance attendance) {

        try {

            Attendance updated =
                    attendanceService.updateAttendance(
                            id,
                            attendance
                    );

            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttendance(
            @PathVariable Integer id) {

        try {

            attendanceService.deleteAttendance(id);

            return ResponseEntity.ok(
                    "Attendance deleted successfully."
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to delete attendance."
                    );
        }
    }
}
