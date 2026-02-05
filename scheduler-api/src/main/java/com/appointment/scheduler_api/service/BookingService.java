package com.appointment.scheduler_api.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.appointment.scheduler_api.dto.SlotResponse;
import com.appointment.scheduler_api.entity.Appointment;
import com.appointment.scheduler_api.entity.Availability;
import com.appointment.scheduler_api.entity.ServiceEntity;
import com.appointment.scheduler_api.repository.AppointmentRepository;
import com.appointment.scheduler_api.repository.AvailabilityRepository;
import com.appointment.scheduler_api.repository.ServiceRepository;
import com.appointment.scheduler_api.repository.UserRepository;

@Service
public class BookingService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private AvailabilityRepository availabilityRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private UserRepository userRepository;

    public List<SlotResponse> getAvailableSlots(Long providerId, LocalDate date) {
        // 1. Get Provider's Schedule
        int dayOfWeek = date.getDayOfWeek().getValue(); 
        int adjustedDayOfWeek = (dayOfWeek == 7) ? 0 : dayOfWeek; // Fix Java Sunday=7 to DB Sunday=0 if needed

        List<Availability> schedule = availabilityRepository.findByProviderId(providerId);
        Availability todaySchedule = schedule.stream()
                .filter(a -> a.getDayOfWeek() == adjustedDayOfWeek)
                .findFirst()
                .orElse(null);

        if (todaySchedule == null) return new ArrayList<>();

        // 2. Get Bookings but FILTER OUT Cancelled/Rejected ones [FIXED HERE]
        List<Appointment> allBookings = appointmentRepository.findByProviderIdAndAppointmentDate(providerId, date);
        
        List<LocalTime> takenTimes = allBookings.stream()
                .filter(a -> a.getStatus() != Appointment.Status.CANCELLED && a.getStatus() != Appointment.Status.REJECTED)
                .map(Appointment::getStartTime)
                .toList();

        // 3. Generate Slots
        List<SlotResponse> slots = new ArrayList<>();
        LocalTime current = todaySchedule.getStartTime();
        
        while (current.isBefore(todaySchedule.getEndTime())) {
            boolean isTaken = takenTimes.contains(current);
            slots.add(new SlotResponse(current, !isTaken));
            current = current.plusMinutes(30);
        }
        
        return slots;
    }

    public Appointment createAppointment(Long clientId, Long serviceId, LocalDate date, LocalTime time) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        Long providerId = service.getProvider().getId();
        
        // Check availability ignoring cancelled appointments [FIXED HERE]
        boolean isTaken = appointmentRepository.findByProviderIdAndAppointmentDate(providerId, date)
                .stream()
                .filter(a -> a.getStatus() != Appointment.Status.CANCELLED && a.getStatus() != Appointment.Status.REJECTED)
                .anyMatch(a -> a.getStartTime().equals(time));

        if (isTaken) throw new RuntimeException("Slot already taken");

        Appointment appt = new Appointment();
        appt.setClient(userRepository.findById(clientId).orElseThrow());
        appt.setService(service);
        appt.setProvider(service.getProvider());
        appt.setAppointmentDate(date);
        appt.setStartTime(time);
        appt.setEndTime(time.plusMinutes(service.getDurationMinutes()));
        appt.setStatus(Appointment.Status.PENDING);

        return appointmentRepository.save(appt);
    }
}