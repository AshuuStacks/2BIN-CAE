package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.User;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Reservation entities.
 */
@Repository
public interface ReservationRepository extends CrudRepository<Reservation, Long> {

  /**
   * Retrieves a list of reservations made by a specific client.
   *
   * @param user the client for whom to retrieve reservations
   * @return a list of reservations associated with the specified client
   */
  List<Reservation> findByClient(User user);
}