package org.phc.templatejavabe.domain.model;

public enum UserStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    PENDING("Pending"),
    SUSPENDED("Suspended");

    private final String displayName;

    UserStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

