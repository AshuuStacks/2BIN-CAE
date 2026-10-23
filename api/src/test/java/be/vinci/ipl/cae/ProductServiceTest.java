package be.vinci.ipl.cae;

import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Unite;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import be.vinci.ipl.cae.demo.repositories.UniteRepository;
import be.vinci.ipl.cae.demo.services.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProductServiceTest {

  @Mock
  private ProductRepository productRepository;

  @Mock
  private UniteRepository uniteRepository;

  @Mock
  private ProductTypeRepository productTypeRepository;

  @InjectMocks
  private ProductService productService;

  private Product product;
  private Unite unite;
  private ProductType productType;

  @BeforeEach
  void setUp() {
    product = new Product();
    product.setId(1L);
    product.setLibelleProduct("Fraise");
    product.setDescription("Fraise fraîche");

    unite = new Unite();
    unite.setId(1L);
    unite.setUnite("Kg");

    productType = new ProductType();
    productType.setId(1L);
    productType.setLibelleType("Fruits");
  }

  @Test
  void addProductShouldReturnNullWhenProductExists() {
    when(productRepository.findByLibelleProduct("Fraise")).thenReturn(product);

    Product result = productService.addProduct("Fraise", "Fraise fraîche", unite, productType);

    assertNull(result);
    verify(productRepository, never()).save(any(Product.class));
  }

  @Test
  void addProductShouldCreateProductWithExistingUniteAndType() {
    when(productRepository.findByLibelleProduct("Fraise")).thenReturn(null);
    when(uniteRepository.findByUnite("Kg")).thenReturn(unite);
    when(productTypeRepository.findByLibelleType("Fruits")).thenReturn(productType);
    when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
      Product p = invocation.getArgument(0);
      p.setId(1L);
      p.setUnite(unite);
      p.setProductType(productType);
      return p;
    });

    Product result = productService.addProduct("Fraise", "Fraise fraîche", unite, productType);

    assertNotNull(result);
    assertEquals("Fraise", result.getLibelleProduct());
    assertEquals("Fraise fraîche", result.getDescription());
    assertEquals(unite, result.getUnite());
    assertEquals(productType, result.getProductType());
    verify(uniteRepository, never()).save(any(Unite.class));
    verify(productTypeRepository, never()).save(any(ProductType.class));
    verify(productRepository, times(1)).save(any(Product.class));
  }

  @Test
  void addProductShouldCreateProductWithNewUniteAndType() {
    when(productRepository.findByLibelleProduct("Fraise")).thenReturn(null);
    when(uniteRepository.findByUnite("Kg")).thenReturn(null);
    when(productTypeRepository.findByLibelleType("Fruits")).thenReturn(null);
    when(uniteRepository.save(any(Unite.class))).thenReturn(unite);
    when(productTypeRepository.save(any(ProductType.class))).thenReturn(productType);
    when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
      Product p = invocation.getArgument(0);
      p.setId(1L);
      p.setUnite(unite);
      p.setProductType(productType);
      return p;
    });

    Product result = productService.addProduct("Fraise", "Fraise fraîche", unite, productType);

    assertNotNull(result);
    assertEquals("Fraise", result.getLibelleProduct());
    assertEquals("Fraise fraîche", result.getDescription());
    assertEquals(unite, result.getUnite());
    assertEquals(productType, result.getProductType());
    verify(uniteRepository, times(1)).save(any(Unite.class));
    verify(productTypeRepository, times(1)).save(any(ProductType.class));
    verify(productRepository, times(1)).save(any(Product.class));
  }

  @Test
  void readOneFromLibelleShouldReturnProductWhenFound() {
    when(productRepository.findByLibelleProduct("Fraise")).thenReturn(product);

    Product result = productService.readOneFromLibelle("Fraise");

    assertNotNull(result);
    assertEquals("Fraise", result.getLibelleProduct());
  }

  @Test
  void readOneFromLibelleShouldReturnNullWhenNotFound() {
    when(productRepository.findByLibelleProduct("Fraise")).thenReturn(null);

    Product result = productService.readOneFromLibelle("Fraise");

    assertNull(result);
  }

  @Test
  void getAllProductsShouldReturnProducts() {
    when(productRepository.findAll()).thenReturn(List.of(product));

    List<Product> result = productService.getAllProducts();

    assertEquals(1, result.size());
    assertEquals("Fraise", result.getFirst().getLibelleProduct());
  }

  @Test
  void getAllProductsShouldReturnEmptyListWhenNoProducts() {
    when(productRepository.findAll()).thenReturn(List.of());

    List<Product> result = productService.getAllProducts();

    assertTrue(result.isEmpty());
  }
}