package org.phc.templatejavabe.domain.model;

public enum ObjectiveStatus {
    NOT_STARTED("Not Started"),
    ON_TRACK("On Track"),
    AT_RISK("At Risk"),
    BEHIND("Behind"),
    CLOSED("Closed"),
    ABANDONED("Abandoned");

    private final String displayName;

    ObjectiveStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

