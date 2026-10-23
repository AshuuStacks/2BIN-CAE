package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductPhoto;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing ProductPhoto entities.
 */
@Repository
public interface ProductPhotoRepository extends CrudRepository<ProductPhoto, Long> {

  /**
   * Retrieves all photos associated with a specific product.
   *
   * @param product The product for which to retrieve photos.
   * @return A list of ProductPhoto entities associated with the product.
   */
  List<ProductPhoto> findByProduct(Product product);

  /**
   * Retrieves all photos associated with a product by its ID.
   *
   * @param productId The ID of the product.
   * @return A list of ProductPhoto entities associated with the product.
   */
  List<ProductPhoto> findByProductId(Long productId);
}