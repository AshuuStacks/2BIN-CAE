package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * ProductType repository.
 */
@Repository
public interface ProductTypeRepository extends JpaRepository<ProductType, Long> {

  /**
   * Find a productType by its libelle.
   *
   * @param libelleType ,
   * @return the user
   */
  ProductType findByLibelleType(String libelleType);
}