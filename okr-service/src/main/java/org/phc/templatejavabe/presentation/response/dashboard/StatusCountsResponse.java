package org.phc.templatejavabe.presentation.response.dashboard;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StatusCountsResponse(
    @JsonProperty("not_started") int notStarted,
    @JsonProperty("at_risk") int atRisk,
    @JsonProperty("behind") int behind,
    @JsonProperty("on_track") int onTrack,
    @JsonProperty("closed") int closed,
    @JsonProperty("abandoned") int abandoned
) {}




