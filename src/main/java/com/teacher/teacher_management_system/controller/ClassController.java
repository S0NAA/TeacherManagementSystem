package com.teacher.teacher_management_system.controller;

import com.teacher.teacher_management_system.entity.ClassEntity;
import com.teacher.teacher_management_system.service.ClassService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    // GET all classes
    @GetMapping
    public List<ClassEntity> getAllClasses() {
        return classService.getAllClasses();
    }

    // ADD class
    @PostMapping
    public ClassEntity addClass(@RequestBody ClassEntity classEntity) {
        return classService.addClass(classEntity);
    }

    // UPDATE class
    @PutMapping("/{classId}")
    public ClassEntity updateClass(
            @PathVariable Integer classId,
            @RequestBody ClassEntity classEntity) {

        return classService.updateClass(classId, classEntity);
    }

    // DELETE class
    @DeleteMapping("/{classId}")
    public void deleteClass(@PathVariable Integer classId) {
        classService.deleteClass(classId);
    }
}
