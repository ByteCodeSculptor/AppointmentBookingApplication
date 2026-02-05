package com.appointment.scheduler_api.dto;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SlotResponse {
    private LocalTime time;
    private boolean isAvailable;
}