package com.teacher.teacher_management_system.controller;

import com.teacher.teacher_management_system.entity.TeacherAssignment;
import com.teacher.teacher_management_system.service.TeacherAssignmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class TeacherAssignmentController {

    private final TeacherAssignmentService teacherAssignmentService;

    public TeacherAssignmentController(
            TeacherAssignmentService teacherAssignmentService) {

        this.teacherAssignmentService =
                teacherAssignmentService;
    }

    // GET ALL ASSIGNMENTS
    @GetMapping
    public List<TeacherAssignment> getAllAssignments() {

        return teacherAssignmentService.getAllAssignments();
    }

    // ADD ASSIGNMENT
    @PostMapping
    public TeacherAssignment addAssignment(
            @RequestBody TeacherAssignment assignment) {

        return teacherAssignmentService.addAssignment(assignment);
    }

    // UPDATE ASSIGNMENT
    @PutMapping("/{id}")
    public TeacherAssignment updateAssignment(
            @PathVariable Integer id,
            @RequestBody TeacherAssignment assignment) {

        return teacherAssignmentService.updateAssignment(
                id,
                assignment
        );
    }

    // DELETE ASSIGNMENT
    @DeleteMapping("/{id}")
    public void deleteAssignment(
            @PathVariable Integer id) {

        teacherAssignmentService.deleteAssignment(id);
    }
}