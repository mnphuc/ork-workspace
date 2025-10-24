package org.phc.templatejavabe.presentation.response.home;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PersonalObjectiveResponse {
    private String id;
    private String title;
    private int progress;
    private String status;
    
    @JsonProperty("last_check_in")
    private String lastCheckIn;
    
    @JsonProperty("due_date")
    private String dueDate;
    
    private String owner;
}

