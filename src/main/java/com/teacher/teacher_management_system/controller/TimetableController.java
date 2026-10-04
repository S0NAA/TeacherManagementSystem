package com.teacher.teacher_management_system.controller;

import com.teacher.teacher_management_system.entity.Timetable;
import com.teacher.teacher_management_system.service.TimetableService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(
            TimetableService timetableService) {

        this.timetableService = timetableService;
    }

    // GET all timetable records
    @GetMapping
    public List<Timetable> getAllTimetables() {
        return timetableService.getAllTimetables();
    }

    // ADD timetable record
    @PostMapping
    public ResponseEntity<?> addTimetable(
            @RequestBody Timetable timetable) {

        try {

            Timetable saved =
                    timetableService.addTimetable(timetable);

            return ResponseEntity.ok(saved);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // UPDATE timetable record
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTimetable(
            @PathVariable Integer id,
            @RequestBody Timetable timetable) {

        try {

            Timetable updated =
                    timetableService.updateTimetable(
                            id,
                            timetable
                    );

            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // DELETE timetable record
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTimetable(
            @PathVariable Integer id) {

        try {

            timetableService.deleteTimetable(id);

            return ResponseEntity.ok(
                    "Timetable deleted successfully."
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body("Unable to delete timetable.");
        }
    }
}
