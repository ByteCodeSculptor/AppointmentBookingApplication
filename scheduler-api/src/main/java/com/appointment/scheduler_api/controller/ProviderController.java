package com.appointment.scheduler_api.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appointment.scheduler_api.entity.Appointment;
import com.appointment.scheduler_api.entity.Availability;
import com.appointment.scheduler_api.entity.ServiceEntity;
import com.appointment.scheduler_api.entity.User;
import com.appointment.scheduler_api.repository.AppointmentRepository;
import com.appointment.scheduler_api.service.ProviderService;

@RestController
@RequestMapping("/api/provider")

public class ProviderController {

    @Autowired private ProviderService providerService;
    @Autowired private AppointmentRepository appointmentRepository;

    @PostMapping("/services")
    public ResponseEntity<?> addService(@RequestBody ServiceEntity service, Authentication auth) {
        User provider = (User) auth.getPrincipal();
        return ResponseEntity.ok(providerService.addService(service, provider));
    }

    @GetMapping("/services")
    public ResponseEntity<?> getMyServices(Authentication auth) {
        User provider = (User) auth.getPrincipal();
        return ResponseEntity.ok(providerService.getServices(provider.getId()));
    }

    @PostMapping("/availability")
    public ResponseEntity<?> updateAvailability(@RequestBody List<Availability> schedule, Authentication auth) {
        User provider = (User) auth.getPrincipal();
        return ResponseEntity.ok(providerService.updateAvailability(schedule, provider));
    }

    @GetMapping("/availability")
    public ResponseEntity<?> getMyAvailability(Authentication auth) {
        User provider = (User) auth.getPrincipal();
        return ResponseEntity.ok(providerService.getAvailability(provider.getId()));
    }

    // --- MOVED FROM CLIENT CONTROLLER ---

    // 1. Get All Booking Requests
    @GetMapping("/appointments")
    public ResponseEntity<?> getProviderAppointments(Authentication auth) {
        User provider = (User) auth.getPrincipal();
        return ResponseEntity.ok(appointmentRepository.findByProviderId(provider.getId()));
    }

    // 2. Accept or Reject Request
    @PatchMapping("/appointment/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id, 
            @RequestParam String status, 
            Authentication auth) {
        
        User provider = (User) auth.getPrincipal();
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getProvider().getId().equals(provider.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        try {
            Appointment.Status newStatus = Appointment.Status.valueOf(status.toUpperCase());
            appt.setStatus(newStatus);
            return ResponseEntity.ok(appointmentRepository.save(appt));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status");
        }
    }
}