package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Product;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Product entities.
 */
@Repository
public interface ProductRepository extends CrudRepository<Product, Long> {

  /**
   * Finds a product by its `libelleProduct`.
   *
   * @param libelleProduct the name or label of the product
   * @return the matching product, or null if not found
   */
  Product findByLibelleProduct(String libelleProduct);
}