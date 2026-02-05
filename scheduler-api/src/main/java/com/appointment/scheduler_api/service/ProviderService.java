package com.appointment.scheduler_api.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appointment.scheduler_api.entity.Availability;
import com.appointment.scheduler_api.entity.ServiceEntity;
import com.appointment.scheduler_api.entity.User;
import com.appointment.scheduler_api.repository.AvailabilityRepository;
import com.appointment.scheduler_api.repository.ServiceRepository;

@Service
public class ProviderService {

    @Autowired private ServiceRepository serviceRepository;
    @Autowired private AvailabilityRepository availabilityRepository;

    public ServiceEntity addService(ServiceEntity service, User provider) {
        service.setProvider(provider);
        return serviceRepository.save(service);
    }

    public List<ServiceEntity> getServices(Long providerId) {
        return serviceRepository.findByProviderId(providerId);
    }

    @Transactional
    public List<Availability> updateAvailability(List<Availability> newSchedule, User provider) {
        // 1. Identify which days are being updated (e.g., [1, 2] for Mon, Tue)
        // We use a Set to avoid duplicate deletes if multiple slots are sent for the same day
        Set<Integer> daysToUpdate = newSchedule.stream()
                .map(Availability::getDayOfWeek)
                .collect(Collectors.toSet());

        // 2. Delete existing slots ONLY for those specific days
        // This ensures that if I update Tuesday, Monday remains untouched.
        for (Integer day : daysToUpdate) {
            availabilityRepository.deleteByProviderIdAndDayOfWeek(provider.getId(), day);
        }

        // 3. Save the new slots
        newSchedule.forEach(slot -> slot.setProvider(provider));
        return availabilityRepository.saveAll(newSchedule);
    }
    
    public List<Availability> getAvailability(Long providerId) {
        return availabilityRepository.findByProviderId(providerId);
    }
}