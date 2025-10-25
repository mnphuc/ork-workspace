package org.phc.templatejavabe.presentation.request.interval;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateIntervalRequest {
    @NotBlank(message = "Interval name is required")
    @Size(max = 128, message = "Interval name must not exceed 128 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @JsonProperty("workspace_id")
    @NotBlank(message = "Workspace ID is required")
    private String workspaceId;

    @JsonProperty("interval_type")
    @NotBlank(message = "Interval type is required")
    private String intervalType; // QUARTER, MONTH, CUSTOM, YEAR

    @JsonProperty("start_date")
    @NotBlank(message = "Start date is required")
    private String startDate;

    @JsonProperty("end_date")
    @NotBlank(message = "End date is required")
    private String endDate;

    @JsonProperty("is_active")
    @NotNull(message = "Active status is required")
    private Boolean isActive = false;

    private String settings; // JSON string for interval settings
}

