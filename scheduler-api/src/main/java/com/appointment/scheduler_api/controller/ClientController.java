package com.appointment.scheduler_api.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appointment.scheduler_api.dto.SlotResponse;
import com.appointment.scheduler_api.entity.Appointment;
import com.appointment.scheduler_api.entity.User;
import com.appointment.scheduler_api.repository.AppointmentRepository;
import com.appointment.scheduler_api.repository.ServiceRepository;
import com.appointment.scheduler_api.service.BookingService;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ClientController {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private BookingService bookingService;
    @Autowired private ServiceRepository serviceRepository;

    @GetMapping("/services")
    public ResponseEntity<?> getAllServices() {
        return ResponseEntity.ok(serviceRepository.findAll());
    }

    @GetMapping("/slots")
    public ResponseEntity<List<SlotResponse>> getSlots(
            @RequestParam Long providerId,
            @RequestParam String date) { 
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(bookingService.getAvailableSlots(providerId, localDate));
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(
            @RequestParam Long serviceId,
            @RequestParam String date,
            @RequestParam String time,
            Authentication auth) {
        
        User client = (User) auth.getPrincipal();
        LocalDate localDate = LocalDate.parse(date);
        LocalTime localTime = LocalTime.parse(time); 

        try {
            Appointment appt = bookingService.createAppointment(client.getId(), serviceId, localDate, localTime);
            return ResponseEntity.ok(appt);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<?> getMyAppointments(Authentication auth) {
        User client = (User) auth.getPrincipal();
        return ResponseEntity.ok(appointmentRepository.findByClientId(client.getId()));
    }

    @PatchMapping("/appointment/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, Authentication auth) {
        User client = (User) auth.getPrincipal();
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getClient().getId().equals(client.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        if (appt.getStatus() != Appointment.Status.PENDING && appt.getStatus() != Appointment.Status.CONFIRMED) {
            return ResponseEntity.badRequest().body("Cannot cancel this appointment");
        }

        appt.setStatus(Appointment.Status.CANCELLED);
        return ResponseEntity.ok(appointmentRepository.save(appt));
    }
}