package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Unite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Unit entities.
 */
@Repository
public interface UniteRepository extends JpaRepository<Unite, Long> {

  /**
   * Finds a unit by its name.
   *
   * @param unite the name of the unit
   * @return the matching unit, or null if not found
   */
  Unite findByUnite(String unite);
}