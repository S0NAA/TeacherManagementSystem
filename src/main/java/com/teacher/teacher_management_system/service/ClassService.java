package com.teacher.teacher_management_system.service;

import com.teacher.teacher_management_system.entity.ClassEntity;
import com.teacher.teacher_management_system.repository.ClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClassService {

    private final ClassRepository classRepository;

    public ClassService(ClassRepository classRepository) {
        this.classRepository = classRepository;
    }

    // GET all classes
    public List<ClassEntity> getAllClasses() {
        return classRepository.findAll();
    }

    // ADD class
    public ClassEntity addClass(ClassEntity classEntity) {
        return classRepository.save(classEntity);
    }

    // UPDATE class
    public ClassEntity updateClass(
            Integer classId,
            ClassEntity classEntity) {

        Optional<ClassEntity> existingClass =
                classRepository.findById(classId);

        if (existingClass.isPresent()) {

            ClassEntity updatedClass =
                    existingClass.get();

            updatedClass.setClassName(
                    classEntity.getClassName()
            );

            updatedClass.setDepartmentId(
                    classEntity.getDepartmentId()
            );

            updatedClass.setSemester(
                    classEntity.getSemester()
            );

            updatedClass.setSection(
                    classEntity.getSection()
            );

            updatedClass.setStatus(
                    classEntity.getStatus()
            );

            return classRepository.save(updatedClass);
        }

        return null;
    }

    // DELETE class
    public void deleteClass(Integer classId) {
        classRepository.deleteById(classId);
    }
}
