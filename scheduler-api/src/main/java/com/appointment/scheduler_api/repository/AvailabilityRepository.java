package com.appointment.scheduler_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appointment.scheduler_api.entity.Availability;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByProviderId(Long providerId);
    
    // OLD METHOD (You can keep it or remove it, but we won't use it for updates anymore)
    void deleteByProviderId(Long providerId); 

    // NEW METHOD: Delete only specific days for a provider
    void deleteByProviderIdAndDayOfWeek(Long providerId, Integer dayOfWeek);
}