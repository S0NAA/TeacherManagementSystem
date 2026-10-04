package com.teacher.teacher_management_system.service;

import com.teacher.teacher_management_system.entity.TeacherAssignment;
import com.teacher.teacher_management_system.entity.Timetable;
import com.teacher.teacher_management_system.repository.TeacherAssignmentRepository;
import com.teacher.teacher_management_system.repository.TimetableRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public TimetableService(
            TimetableRepository timetableRepository,
            TeacherAssignmentRepository teacherAssignmentRepository) {

        this.timetableRepository = timetableRepository;
        this.teacherAssignmentRepository =
                teacherAssignmentRepository;
    }

    // GET ALL
    public List<Timetable> getAllTimetables() {
        return timetableRepository.findAll();
    }

    // ADD
    public Timetable addTimetable(Timetable timetable) {

        validateTimetable(timetable);

        return timetableRepository.save(timetable);
    }

    // UPDATE
    public Timetable updateTimetable(
            Integer timetableId,
            Timetable timetable) {

        Optional<Timetable> existing =
                timetableRepository.findById(timetableId);

        if (existing.isEmpty()) {
            throw new IllegalArgumentException(
                    "Timetable record not found."
            );
        }

        timetable.setTimetableId(timetableId);

        validateTimetable(timetable);

        Timetable updated = existing.get();

        updated.setAssignmentId(
                timetable.getAssignmentId()
        );

        updated.setDayOfWeek(
                timetable.getDayOfWeek()
        );

        updated.setStartTime(
                timetable.getStartTime()
        );

        updated.setEndTime(
                timetable.getEndTime()
        );

        updated.setRoomNo(
                timetable.getRoomNo()
        );

        updated.setStatus(
                timetable.getStatus()
        );

        return timetableRepository.save(updated);
    }

    // DELETE
    public void deleteTimetable(Integer timetableId) {
        timetableRepository.deleteById(timetableId);
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateTimetable(Timetable timetable) {

        // -------------------------------------------------
        // Basic validation
        // -------------------------------------------------

        if (timetable.getAssignmentId() == null) {
            throw new IllegalArgumentException(
                    "Assignment ID is required."
            );
        }

        if (timetable.getDayOfWeek() == null ||
                timetable.getDayOfWeek().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Day is required."
            );
        }

        if (timetable.getStartTime() == null ||
                timetable.getEndTime() == null) {

            throw new IllegalArgumentException(
                    "Start time and end time are required."
            );
        }

        if (!timetable.getStartTime()
                .isBefore(timetable.getEndTime())) {

            throw new IllegalArgumentException(
                    "End time must be after start time."
            );
        }

        // -------------------------------------------------
        // Check Assignment
        // -------------------------------------------------

        Optional<TeacherAssignment> assignmentOptional =
                teacherAssignmentRepository.findById(
                        timetable.getAssignmentId()
                );

        if (assignmentOptional.isEmpty()) {

            throw new IllegalArgumentException(
                    "Assignment ID "
                            + timetable.getAssignmentId()
                            + " does not exist."
            );
        }

        TeacherAssignment assignment =
                assignmentOptional.get();

        // -------------------------------------------------
        // Find overlapping timetable records
        // -------------------------------------------------

        Integer currentTimetableId =
                timetable.getTimetableId() == null
                        ? 0
                        : timetable.getTimetableId();

        List<Timetable> overlapping =
                timetableRepository.findOverlappingTimetables(
                        timetable.getDayOfWeek(),
                        timetable.getStartTime(),
                        timetable.getEndTime(),
                        currentTimetableId
                );

        // -------------------------------------------------
        // Check conflicts
        // -------------------------------------------------

        for (Timetable existing : overlapping) {

            Optional<TeacherAssignment>
                    existingAssignmentOptional =
                    teacherAssignmentRepository.findById(
                            existing.getAssignmentId()
                    );

            if (existingAssignmentOptional.isEmpty()) {
                continue;
            }

            TeacherAssignment existingAssignment =
                    existingAssignmentOptional.get();

            // =============================================
            // 1. SAME TEACHER
            // =============================================

            if (assignment.getTeacherId()
                    .equals(existingAssignment.getTeacherId())) {

                throw new IllegalArgumentException(
                        "Teacher "
                                + assignment.getTeacherId()
                                + " is already assigned during "
                                + timetable.getDayOfWeek()
                                + " "
                                + existing.getStartTime()
                                + " - "
                                + existing.getEndTime()
                                + "."
                );
            }

            // =============================================
            // 2. SAME CLASS
            // =============================================

            if (assignment.getClassId()
                    .equals(existingAssignment.getClassId())) {

                throw new IllegalArgumentException(
                        "Class "
                                + assignment.getClassId()
                                + " already has another subject during "
                                + timetable.getDayOfWeek()
                                + " "
                                + existing.getStartTime()
                                + " - "
                                + existing.getEndTime()
                                + "."
                );
            }

            // =============================================
            // 3. SAME ROOM
            // =============================================

            if (timetable.getRoomNo() != null &&
                    existing.getRoomNo() != null &&
                    timetable.getRoomNo()
                            .trim()
                            .equalsIgnoreCase(
                                    existing.getRoomNo().trim()
                            )) {

                throw new IllegalArgumentException(
                        "Room "
                                + timetable.getRoomNo()
                                + " is already occupied during "
                                + timetable.getDayOfWeek()
                                + " "
                                + existing.getStartTime()
                                + " - "
                                + existing.getEndTime()
                                + "."
                );
            }
        }
    }
}
