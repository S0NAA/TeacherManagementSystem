package com.teacher.teacher_management_system.controller;

import com.teacher.teacher_management_system.entity.Teacher;
import com.teacher.teacher_management_system.service.TeacherService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherService.getAllTeachers();
    }

    @GetMapping("/{teacherId}")
    public Teacher getTeacherById(@PathVariable String teacherId) {
        return teacherService.getTeacherById(teacherId);
    }

    @PostMapping
    public Teacher addTeacher(@RequestBody Teacher teacher) {
        return teacherService.addTeacher(teacher);
    }

    @PutMapping("/{teacherId}")
    public Teacher updateTeacher(
            @PathVariable String teacherId,
            @RequestBody Teacher updatedTeacher) {

        return teacherService.updateTeacher(teacherId, updatedTeacher);
    }

    @DeleteMapping("/{teacherId}")
    public String deleteTeacher(@PathVariable String teacherId) {

        teacherService.deleteTeacher(teacherId);

        return "Teacher deleted successfully";
    }
}