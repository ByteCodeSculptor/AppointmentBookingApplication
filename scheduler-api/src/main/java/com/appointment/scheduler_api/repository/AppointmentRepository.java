package com.appointment.scheduler_api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appointment.scheduler_api.entity.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByProviderId(Long providerId);
    List<Appointment> findByClientId(Long clientId);
    
    // The "Engine" Query: Find all taken slots for a provider on a specific date
    List<Appointment> findByProviderIdAndAppointmentDate(Long providerId, LocalDate appointmentDate);
}