package org.phc.templatejavabe.domain.model;

public enum MetricType {
    NUMBER("Number"),
    PERCENT("Percent"),
    CURRENCY("Currency"),
    BOOLEAN("Boolean");

    private final String displayName;

    MetricType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

