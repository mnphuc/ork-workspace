package org.phc.templatejavabe.infrastructure.repository;

import java.util.List;
import org.phc.templatejavabe.domain.model.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CheckInRepository extends JpaRepository<CheckIn, String> {
    List<CheckIn> findByKeyResultIdOrderByCreatedDateDesc(String keyResultId);
    List<CheckIn> findByKeyResultIdOrderByCreatedDateAsc(String keyResultId);
    
    @Query("SELECT c FROM CheckIn c ORDER BY c.createdDate DESC")
    List<CheckIn> findTop10ByOrderByCreatedDateDesc();
}



