package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Producer;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Producer repository.
 */
@Repository
public interface ProducerRepository extends CrudRepository<Producer, Long> {
}