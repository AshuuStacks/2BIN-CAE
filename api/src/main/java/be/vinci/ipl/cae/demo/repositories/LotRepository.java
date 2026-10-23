package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Lot;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Lot entities.
 */
@Repository
public interface LotRepository extends CrudRepository<Lot, Long> {

  /**
   * Retrieves all lots with the specified status.
   *
   * @param lotStatus the status of the lots to retrieve
   * @return a list of lots matching the specified status
   */
  List<Lot> findByLotStatus(String lotStatus);

  /**
   * Retrieves a lot by its unique business identifier.
   *
   * @param idLot the unique identifier of the lot
   * @return the matching lot, or null if not found
   */
  Lot findByIdLot(Long idLot);

  /**
   * Retrieves the top 10 lots ordered by their proposal date in descending order.
   *
   * @return a list of the top 10 most recently proposed lots
   */
  List<Lot> findTop10ByOrderByProposalDateDesc();
}