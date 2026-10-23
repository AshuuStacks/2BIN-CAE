package be.vinci.ipl.cae;

import be.vinci.ipl.cae.demo.models.dtos.NewLot;
import be.vinci.ipl.cae.demo.models.entities.Lot;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductPhoto;
import be.vinci.ipl.cae.demo.repositories.LotRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.ProductPhotoRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import be.vinci.ipl.cae.demo.services.LotService;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobClientBuilder;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LotServiceTest {

  @Mock private LotRepository lotRepository;
  @Mock private ProductRepository productRepository;
  @Mock private ProducerRepository producerRepository;
  @Mock private ProductPhotoRepository productPhotoRepository;
  @Mock private BlobClientBuilder blobClientBuilder;
  @Mock private BlobClient blobClient;
  @Mock private MultipartFile image;

  @InjectMocks
  private LotService lotService;

  private Product product;
  private Producer producer;
  private Lot lot;
  private ProductPhoto photo;
  private NewLot newLot;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);

    // Initialize test data
    product = new Product();
    product.setId(1L);
    product.setLibelleProduct("Tomato");

    producer = new Producer();
    producer.setUserId(1L);
    producer.setCompanyName("Ferme Bio");

    lot = new Lot();
    lot.setIdLot(1L);
    lot.setLotStatus("en vente");
    lot.setPrice(5.0);
    lot.setInitialQuantity(10);
    lot.setSoldQuantity(2);
    lot.setReservedQuantity(3);
    lot.setRemainingQuantity(5);
    lot.setWithdrawnQuantity(0);
    lot.setAvailableDate(LocalDate.now());
    lot.setProposalDate(LocalDate.now().minusDays(1));
    lot.setProduct(product);
    lot.setProducer(producer);

    photo = new ProductPhoto();
    photo.setIdPhoto(1L);
    photo.setUrl("https://blob.storage/tomato.jpg");
    photo.setProduct(product);

    newLot = new NewLot();
    newLot.setProductId(1L);
    newLot.setProducerId(1L);
    newLot.setPrice(5.0);
    newLot.setInitialQuantity(10);
    newLot.setSoldQuantity(2);
    newLot.setReservedQuantity(3);
    newLot.setRemainingQuantity(5);
    newLot.setWithdrawnQuantity(0);
    newLot.setLotStatus("en vente");
    newLot.setAvailableDate(LocalDate.now().plusDays(1));

    // Inject BlobClientBuilder mock
    lotService = new LotService(
        lotRepository,
        productPhotoRepository,
        productRepository,
        producerRepository,
        "https://blob.storage",
        "sasToken",
        "container"
    );
  }

  @Test
  void getLotsByStatus_success() {
    String status = "en vente";
    List<Lot> lots = Collections.singletonList(lot);
    when(lotRepository.findByLotStatus(status)).thenReturn(lots);

    List<Lot> result = lotService.getLotsByStatus(status);

    assertEquals(lots, result);
    verify(lotRepository).findByLotStatus(status);
  }

  @Test
  void getLotsByStatus_emptyList() {
    String status = "en vente";
    when(lotRepository.findByLotStatus(status)).thenReturn(Collections.emptyList());

    List<Lot> result = lotService.getLotsByStatus(status);

    assertTrue(result.isEmpty());
    verify(lotRepository).findByLotStatus(status);
  }


  @Test
  void getPendingOrAcceptedLotsThrowsInternalServerError() {
    when(lotRepository.findByLotStatus("en attente")).thenThrow(new RuntimeException("DB error"));

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.getPendingOrAcceptedLots());
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
    verify(lotRepository).findByLotStatus("en attente");
  }

  @Test
  void getAllLots_success() {
    List<Lot> lots = Collections.singletonList(lot);
    when(lotRepository.findAll()).thenReturn(lots);

    List<Lot> result = lotService.getAllLots();

    assertEquals(lots, result);
    verify(lotRepository).findAll();
  }

  @Test
  void getAllLotsThrowsInternalServerError() {
    when(lotRepository.findAll()).thenThrow(new RuntimeException("DB error"));

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.getAllLots());
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
    verify(lotRepository).findAll();
  }

  @Test
  void getAvailableLots_success() {
    lot.setAvailableDate(LocalDate.now().minusDays(1));
    List<Lot> lots = Collections.singletonList(lot);
    when(lotRepository.findByLotStatus("en vente")).thenReturn(lots);

    List<Lot> result = lotService.getAvailableLots();

    assertEquals(lots, result);
    verify(lotRepository).findByLotStatus("en vente");
  }

  @Test
  void getAvailableLotsFiltersOutFutureLotsAndZeroQuantity() {
    Lot futureLot = new Lot();
    futureLot.setLotStatus("en vente");
    futureLot.setAvailableDate(LocalDate.now().plusDays(1));
    futureLot.setRemainingQuantity(5);

    Lot zeroQuantityLot = new Lot();
    zeroQuantityLot.setLotStatus("en vente");
    zeroQuantityLot.setAvailableDate(LocalDate.now().minusDays(1));
    zeroQuantityLot.setRemainingQuantity(0);

    List<Lot> lots = Arrays.asList(lot, futureLot, zeroQuantityLot);
    when(lotRepository.findByLotStatus("en vente")).thenReturn(lots);

    List<Lot> result = lotService.getAvailableLots();

    assertEquals(1, result.size());
    assertTrue(result.contains(lot));
    verify(lotRepository).findByLotStatus("en vente");
  }

  @Test
  void getAvailableLotsThrowsInternalServerError() {
    when(lotRepository.findByLotStatus("en vente")).thenThrow(new RuntimeException("DB error"));

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.getAvailableLots());
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
    verify(lotRepository).findByLotStatus("en vente");
  }

  @Test
  void getRecentLotsSuccess() {
    List<Lot> lots = Collections.singletonList(lot);
    when(lotRepository.findTop10ByOrderByProposalDateDesc()).thenReturn(lots);

    List<Lot> result = lotService.getRecentLots();

    assertEquals(lots, result);
    verify(lotRepository).findTop10ByOrderByProposalDateDesc();
  }

  @Test
  void getRecentLotsEmptyList() {
    when(lotRepository.findTop10ByOrderByProposalDateDesc()).thenReturn(Collections.emptyList());

    List<Lot> result = lotService.getRecentLots();

    assertTrue(result.isEmpty());
    verify(lotRepository).findTop10ByOrderByProposalDateDesc();
  }

  @Test
  void getPhotosByProductIdSuccess() {
    when(productRepository.findById(1L)).thenReturn(Optional.of(product));
    when(productPhotoRepository.findByProduct(product)).thenReturn(Collections.singletonList(photo));

    List<Object> result = lotService.getPhotosByProductId(1L);

    assertEquals(1, result.size());
    Map<String, Object> photoMap = (Map<String, Object>) result.getFirst();
    assertEquals(1L, photoMap.get("idPhoto"));
    assertEquals("https://blob.storage/tomato.jpg", photoMap.get("url"));
    verify(productRepository).findById(1L);
    verify(productPhotoRepository).findByProduct(product);
  }



  @Test
  void getPhotosByProductIdThrowsInternalServerError() {
    when(productRepository.findById(1L)).thenThrow(new RuntimeException("DB error"));

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.getPhotosByProductId(1L));
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
    verify(productRepository).findById(1L);
  }




  @Test
  void addLot_success_withExistingPhoto() {
    newLot.setPhotoId(1L);
    when(productRepository.findById(1L)).thenReturn(Optional.of(product));
    when(producerRepository.findById(1L)).thenReturn(Optional.of(producer));
    when(productPhotoRepository.findById(1L)).thenReturn(Optional.of(photo));
    when(lotRepository.save(any(Lot.class))).thenReturn(lot);

    Lot result = lotService.addLot(newLot, null);

    assertEquals(lot, result);
    verify(productPhotoRepository).findById(1L);
    verify(lotRepository).save(any(Lot.class));
  }






  @Test
  void updateLot_success() {
    when(lotRepository.findByIdLot(1L)).thenReturn(lot);
    when(lotRepository.save(lot)).thenReturn(lot);

    lotService.updateLot(lot);

    verify(lotRepository).findByIdLot(1L);
    verify(lotRepository).save(lot);
  }

  @Test
  void updateLot_notFound() {
    when(lotRepository.findByIdLot(1L)).thenReturn(null);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.updateLot(lot));
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    verify(lotRepository).findByIdLot(1L);
  }

  @Test
  void updateLot_invalidQuantities() {
    lot.setInitialQuantity(10);
    lot.setSoldQuantity(5);
    lot.setReservedQuantity(5);
    lot.setRemainingQuantity(5);
    when(lotRepository.findByIdLot(1L)).thenReturn(lot);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.updateLot(lot));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    verify(lotRepository).findByIdLot(1L);
  }

  @Test
  void acceptLot_success() {
    lot.setLotStatus("en attente");
    when(lotRepository.findByIdLot(1L)).thenReturn(lot);
    when(lotRepository.save(lot)).thenReturn(lot);

    Lot result = lotService.acceptLot(1L);

    assertEquals("accepté", result.getLotStatus());
    verify(lotRepository).findByIdLot(1L);
    verify(lotRepository).save(lot);
  }

  @Test
  void acceptLot_notFound() {
    when(lotRepository.findByIdLot(1L)).thenReturn(null);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.acceptLot(1L));
    assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    verify(lotRepository).findByIdLot(1L);
  }

  @Test
  void acceptLot_invalidStatus() {
    lot.setLotStatus("en vente");
    when(lotRepository.findByIdLot(1L)).thenReturn(lot);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.acceptLot(1L));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    verify(lotRepository).findByIdLot(1L);
  }

  @Test
  void receiveLot_success() {
    lot.setLotStatus("accepté");
    when(lotRepository.findByIdLot(1L)).thenReturn(lot);
    when(lotRepository.save(lot)).thenReturn(lot);

    Lot result = lotService.receiveLot(1L);

    assertEquals("en vente", result.getLotStatus());
    assertEquals(LocalDate.now(), result.getReceptionDate());
    verify(lotRepository).findByIdLot(1L);
    verify(lotRepository).save(lot);
  }

  @Test
  void receiveLot_alreadyReceived() {
    lot.setLotStatus("accepté");
    lot.setReceptionDate(LocalDate.now());
    when(lotRepository.findByIdLot(1L)).thenReturn(lot);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.receiveLot(1L));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    verify(lotRepository).findByIdLot(1L);
  }

  @Test
  void refuseLot_success() {
    lot.setLotStatus("en attente");
    when(lotRepository.findByIdLot(1L)).thenReturn(lot);
    when(lotRepository.save(lot)).thenReturn(lot);

    Lot result = lotService.refuseLot(1L, "Quality issue");

    assertEquals("refusé", result.getLotStatus());
    assertEquals("Quality issue", result.getRefusalReason());
    verify(lotRepository).findByIdLot(1L);
    verify(lotRepository).save(lot);
  }

  @Test
  void refuseLot_invalidStatus() {
    lot.setLotStatus("en vente");
    when(lotRepository.findByIdLot(1L)).thenReturn(lot);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class,
        () -> lotService.refuseLot(1L, "Quality issue"));
    assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    verify(lotRepository).findByIdLot(1L);
  }
}