package com.teacher.teacher_management_system.service;

import com.teacher.teacher_management_system.entity.LeaveRequest;
import com.teacher.teacher_management_system.repository.LeaveRequestRepository;
import com.teacher.teacher_management_system.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final TeacherRepository teacherRepository;

    public LeaveRequestService(
            LeaveRequestRepository leaveRequestRepository,
            TeacherRepository teacherRepository) {

        this.leaveRequestRepository =
                leaveRequestRepository;

        this.teacherRepository =
                teacherRepository;
    }

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    public LeaveRequest addLeaveRequest(
            LeaveRequest leaveRequest) {

        validateLeaveRequest(leaveRequest);

        leaveRequest.setTeacherId(
                leaveRequest.getTeacherId().trim()
        );

        leaveRequest.setLeaveType(
                leaveRequest.getLeaveType().trim()
        );

        leaveRequest.setStatus(
                leaveRequest.getStatus() == null ||
                        leaveRequest.getStatus().trim().isEmpty()
                        ? "Pending"
                        : leaveRequest.getStatus().trim()
        );

        if (leaveRequest.getReason() != null) {
            leaveRequest.setReason(
                    leaveRequest.getReason().trim()
            );
        }

        if (leaveRequest.getAppliedOn() == null) {
            leaveRequest.setAppliedOn(
                    LocalDate.now()
            );
        }

        return leaveRequestRepository.save(
                leaveRequest
        );
    }

    public LeaveRequest updateLeaveRequest(
            Integer id,
            LeaveRequest updatedLeave) {

        LeaveRequest existing =
                leaveRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Leave request not found."
                                )
                        );

        validateLeaveRequest(updatedLeave);

        existing.setTeacherId(
                updatedLeave.getTeacherId().trim()
        );

        existing.setLeaveType(
                updatedLeave.getLeaveType().trim()
        );

        existing.setFromDate(
                updatedLeave.getFromDate()
        );

        existing.setToDate(
                updatedLeave.getToDate()
        );

        existing.setReason(
                updatedLeave.getReason() == null
                        ? null
                        : updatedLeave.getReason().trim()
        );

        existing.setStatus(
                updatedLeave.getStatus() == null ||
                        updatedLeave.getStatus().trim().isEmpty()
                        ? "Pending"
                        : updatedLeave.getStatus().trim()
        );

        /*
         * Applied date is preserved during edit.
         */

        return leaveRequestRepository.save(
                existing
        );
    }

    public void deleteLeaveRequest(Integer id) {

        if (!leaveRequestRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Leave request not found."
            );
        }

        leaveRequestRepository.deleteById(id);
    }

    private void validateLeaveRequest(
            LeaveRequest leaveRequest) {

        if (leaveRequest.getTeacherId() == null ||
                leaveRequest.getTeacherId().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Teacher is required."
            );
        }

        if (!teacherRepository.existsById(
                leaveRequest.getTeacherId().trim())) {

            throw new IllegalArgumentException(
                    "Selected teacher does not exist."
            );
        }

        if (leaveRequest.getLeaveType() == null ||
                leaveRequest.getLeaveType().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Leave type is required."
            );
        }

        if (leaveRequest.getFromDate() == null) {
            throw new IllegalArgumentException(
                    "From date is required."
            );
        }

        if (leaveRequest.getToDate() == null) {
            throw new IllegalArgumentException(
                    "To date is required."
            );
        }

        if (leaveRequest.getToDate()
                .isBefore(leaveRequest.getFromDate())) {

            throw new IllegalArgumentException(
                    "To date cannot be before from date."
            );
        }

        String leaveType =
                leaveRequest.getLeaveType()
                        .trim();

        if (!leaveType.equals("Casual") &&
                !leaveType.equals("Sick") &&
                !leaveType.equals("Earned") &&
                !leaveType.equals("Emergency") &&
                !leaveType.equals("Other")) {

            throw new IllegalArgumentException(
                    "Invalid leave type."
            );
        }

        String status =
                leaveRequest.getStatus() == null ||
                        leaveRequest.getStatus().trim().isEmpty()
                        ? "Pending"
                        : leaveRequest.getStatus().trim();

        if (!status.equals("Pending") &&
                !status.equals("Approved") &&
                !status.equals("Rejected")) {

            throw new IllegalArgumentException(
                    "Invalid leave status."
            );
        }
    }
}
