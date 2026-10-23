package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Unite;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import be.vinci.ipl.cae.demo.repositories.UniteRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for managing products, including creation, retrieval, and listing.
 */
@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final UniteRepository uniteRepository;
  private final ProductTypeRepository productTypeRepository;

  /**
   * Constructor for ProductService.
   *
   * @param productRepository Repository for managing products.
   * @param uniteRepository Repository for managing units.
   * @param productTypeRepository Repository for managing product types.
   */
  @Autowired
  public ProductService(ProductRepository productRepository,
      UniteRepository uniteRepository,
      ProductTypeRepository productTypeRepository) {
    this.productRepository = productRepository;
    this.uniteRepository = uniteRepository;
    this.productTypeRepository = productTypeRepository;
  }

  /**
   * Adds a new product to the system.
   *
   * @param libelleProduct The name of the product.
   * @param description The description of the product.
   * @param unite The unit associated with the product.
   * @param productType The type of the product.
   * @return The created product, or null if the product already exists.
   */
  public Product addProduct(String libelleProduct, String description, Unite unite,
      ProductType productType) {
    // Check if the product already exists
    Product existingProduct = productRepository.findByLibelleProduct(libelleProduct);
    if (existingProduct != null) {
      return null;
    }

    // Handle unit
    Unite existingUnite = uniteRepository.findByUnite(unite.getUnite());
    if (existingUnite == null) {
      unite = uniteRepository.save(unite);
    } else {
      unite = existingUnite;
    }

    // Handle product type
    ProductType existingProductType =
        productTypeRepository.findByLibelleType(productType.getLibelleType());
    if (existingProductType == null) {
      productType = productTypeRepository.save(productType);
    } else {
      productType = existingProductType;
    }

    // Create and save the new product
    Product newProduct = new Product();
    newProduct.setLibelleProduct(libelleProduct);
    newProduct.setDescription(description);
    newProduct.setUnite(unite);
    newProduct.setProductType(productType);

    return productRepository.save(newProduct);
  }

  /**
   * Retrieves a product by its name.
   *
   * @param libelleProduct The name of the product.
   * @return The product with the specified name, or null if not found.
   */
  public Product readOneFromLibelle(String libelleProduct) {
    return productRepository.findByLibelleProduct(libelleProduct);
  }

  /**
   * Retrieves all products in the system.
   *
   * @return A list of all products.
   */
  public List<Product> getAllProducts() {
    return (List<Product>) productRepository.findAll();
  }
}