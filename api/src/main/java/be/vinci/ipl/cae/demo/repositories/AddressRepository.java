package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Address;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**

 Address repository.*/
@Repository
public interface AddressRepository extends CrudRepository<Address, Long> {
}