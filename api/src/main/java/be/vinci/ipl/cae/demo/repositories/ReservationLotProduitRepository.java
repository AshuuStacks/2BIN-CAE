package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ReservationLotProduit;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing ReservationLotProduit entities.
 */
@Repository
public interface ReservationLotProduitRepository extends
    CrudRepository<ReservationLotProduit, Long> {
}