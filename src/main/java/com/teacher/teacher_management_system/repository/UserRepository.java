package com.teacher.teacher_management_system.repository;

import com.teacher.teacher_management_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByUsername(String username);

    boolean existsByTeacherId(String teacherId);
}