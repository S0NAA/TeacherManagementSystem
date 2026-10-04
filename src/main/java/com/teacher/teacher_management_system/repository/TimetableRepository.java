package com.teacher.teacher_management_system.repository;

import com.teacher.teacher_management_system.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.List;

public interface TimetableRepository
        extends JpaRepository<Timetable, Integer> {

    @Query("""
        SELECT t
        FROM Timetable t
        WHERE t.dayOfWeek = :dayOfWeek
        AND t.startTime < :endTime
        AND t.endTime > :startTime
        AND t.timetableId <> :timetableId
    """)
    List<Timetable> findOverlappingTimetables(
            @Param("dayOfWeek") String dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("timetableId") Integer timetableId
    );

    boolean existsByAssignmentId(Integer assignmentId);
}