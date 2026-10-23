package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewProduit;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.services.ProductService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * ProductController to handle product-related actions.
 */
@RestController
@RequestMapping("/product")
public class ProductController {

  private final ProductService productService;

  /**
   * Constructor to inject the ProductService.
   *
   * @param productService the service handling product operations
   */
  @Autowired
  public ProductController(ProductService productService) {
    this.productService = productService;
  }

  /**
   * Adds a new product.
   *
   * @param newProduct the product details from the request body
   * @return the newly added product
   * @throws ResponseStatusException if the product already exists or cannot be created
   */
  @PostMapping("/add")
  public NewProduit addProduct(@RequestBody NewProduit newProduct) {

    // Check if a product with the same name already exists
    Product existingProduct = productService.readOneFromLibelle(newProduct.getLibelleProduct());
    if (existingProduct != null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Product already exists");
    }

    // Add the new product
    Product addedProduct = productService.addProduct(
        newProduct.getLibelleProduct(),
        newProduct.getDescription(),
        newProduct.getUnite(),
        newProduct.getProductType()
    );

    // Check if the product was successfully created
    if (addedProduct == null) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Product could not be created");
    }
    return newProduct;
  }

  /**
   * Retrieves all products.
   *
   * @return a list of all products
   */
  @GetMapping("/all")
  public List<Product> getAllProducts() {
    return productService.getAllProducts();
  }
}