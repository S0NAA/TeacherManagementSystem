package com.teacher.teacher_management_system.controller;

import com.teacher.teacher_management_system.entity.LeaveRequest;
import com.teacher.teacher_management_system.service.LeaveRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(
            LeaveRequestService leaveRequestService) {

        this.leaveRequestService =
                leaveRequestService;
    }

    @GetMapping
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestService
                .getAllLeaveRequests();
    }

    @PostMapping
    public ResponseEntity<?> addLeaveRequest(
            @RequestBody LeaveRequest leaveRequest) {

        try {

            return ResponseEntity.ok(
                    leaveRequestService
                            .addLeaveRequest(leaveRequest)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeaveRequest(
            @PathVariable Integer id,
            @RequestBody LeaveRequest leaveRequest) {

        try {

            return ResponseEntity.ok(
                    leaveRequestService
                            .updateLeaveRequest(
                                    id,
                                    leaveRequest
                            )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeaveRequest(
            @PathVariable Integer id) {

        try {

            leaveRequestService
                    .deleteLeaveRequest(id);

            return ResponseEntity.ok().build();

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}
