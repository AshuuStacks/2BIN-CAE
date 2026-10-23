package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.NewLot;
import be.vinci.ipl.cae.demo.models.entities.Lot;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductPhoto;
import be.vinci.ipl.cae.demo.repositories.LotRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.ProductPhotoRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.BlobStorageException;
import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service for managing lots, including creation, retrieval, and updates.
 */
@Service
public class LotService {

  private final LotRepository lotRepository;
  private final ProductPhotoRepository productPhotoRepository;
  private final ProductRepository productRepository;
  private final ProducerRepository producerRepository;
  private final String blobServiceEndpoint;
  private final String sasToken;
  private final String containerName;

  /**
   * Constructs a LotService with required dependencies.
   *
   * @param lotRepository Repository for lots
   * @param productPhotoRepository Repository for product photos
   * @param productRepository Repository for products
   * @param producerRepository Repository for producers
   * @param endpoint Azure Blob Storage endpoint
   * @param sasToken Azure Blob Storage SAS token
   * @param container Azure Blob Storage container name
   */
  public LotService(
      LotRepository lotRepository,
      ProductPhotoRepository productPhotoRepository,
      ProductRepository productRepository,
      ProducerRepository producerRepository,
      @Value("${azure.blob.service-endpoint}") String endpoint,
      @Value("${azure.blob.sas-token}") String sasToken,
      @Value("${azure.blob.container-name}") String container) {
    this.lotRepository = lotRepository;
    this.productPhotoRepository = productPhotoRepository;
    this.productRepository = productRepository;
    this.producerRepository = producerRepository;
    this.blobServiceEndpoint = endpoint;
    this.sasToken = sasToken;
    this.containerName = container;
  }

  /**
   * Retrieves lots by status.
   *
   * @param status The status to filter lots
   * @return List of lots with the given status
   */
  public List<Lot> getLotsByStatus(String status) {
    return lotRepository.findByLotStatus(status);
  }

  /**
   * Retrieves lots with status 'en attente' or 'accepté'.
   *
   * @return List of lots with status 'en attente' or 'accepté'
   */
  public List<Lot> getPendingOrAcceptedLots() {
    try {
      List<Lot> pendingLots = lotRepository.findByLotStatus("en attente");
      List<Lot> acceptedLots = lotRepository.findByLotStatus("accepté");
      pendingLots.addAll(acceptedLots);
      return pendingLots;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to retrieve pending or accepted lots", e);
    }
  }

  /**
   * Retrieves all lots.
   *
   * @return List of all lots
   * @throws ResponseStatusException if retrieval fails
   */
  public List<Lot> getAllLots() {
    try {
      return (List<Lot>) lotRepository.findAll();
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to retrieve lots", e);
    }
  }

  /**
   * Retrieves available lots (status 'en vente', available
   * today or earlier, with remaining quantity).
   *
   * @return List of available lots
   * @throws ResponseStatusException if retrieval fails
   */
  public List<Lot> getAvailableLots() {
    try {
      return lotRepository.findByLotStatus("en vente").stream()
          .filter(lot -> lot.getAvailableDate() != null
              && !lot.getAvailableDate().isAfter(LocalDate.now()))
          .filter(lot -> lot.getRemainingQuantity() > 0)
          .collect(Collectors.toList());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to retrieve available lots", e);
    }
  }

  /**
   * Retrieves the 10 most recent lots ordered by proposal date.
   *
   * @return List of recent lots
   */
  public List<Lot> getRecentLots() {
    return lotRepository.findTop10ByOrderByProposalDateDesc();
  }

  /**
   * Retrieves photos for a product.
   *
   * @param productId The product ID
   * @return List of photo objects with idPhoto and URL
   * @throws ResponseStatusException if product not found or retrieval fails
   */
  public List<Object> getPhotosByProductId(Long productId) {
    try {
      Product product = productRepository.findById(productId)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
              "Product not found"));
      List<ProductPhoto> photos = productPhotoRepository.findByProduct(product);
      return photos.stream().map(photo -> {
        Map<String, Object> photoMap = new HashMap<>();
        photoMap.put("idPhoto", photo.getIdPhoto());
        photoMap.put("url", photo.getUrl());
        return photoMap;
      }).collect(Collectors.toList());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to retrieve photos", e);
    }
  }

  /**
   * Adds a new lot.
   *
   * @param newLot The lot details
   * @param image The lot image (optional if photoId provided)
   * @return The created lot
   * @throws ResponseStatusException if creation fails
   */
  @Transactional
  public Lot addLot(NewLot newLot, MultipartFile image) {
    try {
      Product product = productRepository.findById(newLot.getProductId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
              "Product not found"));
      Producer producer = producerRepository.findById(newLot.getProducerId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
              "Producer not found"));

      LocalDate today = LocalDate.now();
      if (newLot.getAvailableDate() != null
          && newLot.getAvailableDate().isBefore(today)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Available date cannot be before proposal date");
      }

      validateQuantities(newLot);

      Lot lot = new Lot();
      lot.setPrice(newLot.getPrice());
      lot.setInitialQuantity(newLot.getInitialQuantity());
      lot.setSoldQuantity(newLot.getSoldQuantity());
      lot.setReservedQuantity(newLot.getReservedQuantity());
      lot.setRemainingQuantity(newLot.getRemainingQuantity());
      lot.setWithdrawnQuantity(newLot.getWithdrawnQuantity());
      lot.setLotStatus(newLot.getLotStatus());
      lot.setAvailableDate(newLot.getAvailableDate());
      lot.setProposalDate(today);
      lot.setProduct(product);
      lot.setProducer(producer);

      ProductPhoto photo = handlePhoto(newLot, image, product);
      lot.setPhoto(photo);

      return lotRepository.save(lot);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to create lot", e);
    }
  }

  /**
   * Updates an existing lot.
   *
   * @param lot The lot to update
   * @throws ResponseStatusException if lot not found or quantities invalid
   */
  @Transactional
  public void updateLot(Lot lot) {
    Lot existingLot = lotRepository.findByIdLot(lot.getIdLot());
    if (existingLot == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot not found");
    }
    validateQuantities(lot);
    lotRepository.save(lot);
  }

  /**
   * Validates lot quantities.
   *
   * @param lot The lot or DTO to validate
   * @throws ResponseStatusException if quantities are inconsistent
   */
  private void validateQuantities(Object lot) {
    int initial;
    int sold;
    int reserved;
    int remaining;
    int withdrawn;
    if (lot instanceof NewLot newLot) {
      initial = newLot.getInitialQuantity();
      sold = newLot.getSoldQuantity();
      reserved = newLot.getReservedQuantity();
      remaining = newLot.getRemainingQuantity();
      withdrawn = newLot.getWithdrawnQuantity();
    } else {
      Lot existingLot = (Lot) lot;
      initial = existingLot.getInitialQuantity();
      sold = existingLot.getSoldQuantity();
      reserved = existingLot.getReservedQuantity();
      remaining = existingLot.getRemainingQuantity();
      withdrawn = existingLot.getWithdrawnQuantity();
    }
    if (initial != sold + reserved + remaining + withdrawn) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Quantities are inconsistent: initial must equal sold + reserved + "
              + "remaining + withdrawn");
    }
  }

  /**
   * Handles photo for a lot.
   *
   * @param newLot The lot details
   * @param image The image file
   * @param product The associated product
   * @return The product photo
   * @throws ResponseStatusException if photo handling fails
   */
  @Transactional
  protected ProductPhoto handlePhoto(NewLot newLot, MultipartFile image,
      Product product) {
    if (newLot.getPhotoId() != null) {
      return productPhotoRepository.findById(newLot.getPhotoId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
              "Photo not found"));
    }
    if (image != null && !image.isEmpty()) {
      String blobUrl = uploadImageToBlob(image);
      ProductPhoto photo = new ProductPhoto();
      photo.setUrl(blobUrl);
      photo.setProduct(product);
      return productPhotoRepository.save(photo);
    }
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
        "An image or photo ID is required");
  }

  /**
   * Retrieves a lot by ID.
   *
   * @param idLot The lot ID
   * @return The lot, or null if not found
   * @throws ResponseStatusException if retrieval fails
   */
  public Lot readOneFromLotId(Long idLot) {
    try {
      return lotRepository.findByIdLot(idLot);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to retrieve lot", e);
    }
  }

  /**
   * Uploads an image to Azure Blob Storage.
   *
   * @param image The image file
   * @return The uploaded image URL
   * @throws ResponseStatusException if upload fails
   */
  private String uploadImageToBlob(MultipartFile image) {
    try {
      String imageUuid = UUID.randomUUID().toString();
      Map<String, String> metadata = new HashMap<>();
      String originalFileName = image.getOriginalFilename();
      if (originalFileName != null) {
        String cleanedFileName = originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
        metadata.put("originalFileName", cleanedFileName);
      } else {
        metadata.put("originalFileName", "unknown");
      }

      BlobClientBuilder blobClient = new BlobClientBuilder()
          .endpoint(blobServiceEndpoint)
          .sasToken(sasToken)
          .containerName(containerName)
          .blobName(imageUuid);

      blobClient.buildClient().upload(image.getInputStream(), image.getSize(),
          true);
      blobClient.buildClient().setMetadata(metadata);
      blobClient.buildClient().setHttpHeaders(
          new BlobHttpHeaders().setContentType(image.getContentType()));
      return blobClient.buildClient().getBlobUrl();
    } catch (BlobStorageException e) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Failed to upload image due to invalid metadata: " + e.getMessage(),
          e
      );
    } catch (IOException e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Failed to upload image due to I/O error",
          e
      );
    } catch (Exception e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Unexpected error during image upload",
          e
      );
    }
  }

  /**
   * Validates a lot's existence and status.
   *
   * @param idLot The lot ID
   * @param expectedStatus The expected status
   * @return The validated lot
   * @throws ResponseStatusException if lot not found or status invalid
   */
  private Lot findAndValidateLot(Long idLot, String expectedStatus) {
    Lot lot = lotRepository.findByIdLot(idLot);
    if (lot == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot not found");
    }
    if (!expectedStatus.equals(lot.getLotStatus())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Lot is not in '" + expectedStatus + "' status");
    }
    return lot;
  }

  /**
   * Accepts a lot, changing its status to 'accepté'.
   *
   * @param idLot The ID of the lot to accept
   * @return The updated lot
   * @throws ResponseStatusException if the lot is not found or not pending
   */
  @Transactional
  public Lot acceptLot(Long idLot) {
    Lot lot = findAndValidateLot(idLot, "en attente");
    lot.setLotStatus("accepté");
    return lotRepository.save(lot);
  }

  /**
   * Receives a lot, sets the reception date to today, and changes the status to 'en vente'.
   *
   * @param idLot The ID of the lot to receive
   * @return The updated lot
   * @throws ResponseStatusException if the lot is not found or already received
   */
  @Transactional
  public Lot receiveLot(Long idLot) {
    Lot lot = findAndValidateLot(idLot, "accepté");
    if (lot.getReceptionDate() != null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Lot has already been received");
    }
    lot.setReceptionDate(LocalDate.now());
    lot.setLotStatus("en vente");
    return lotRepository.save(lot);
  }

  /**
   * Refuses a lot, changing its status to 'refusé' and saving the refusal reason.
   *
   * @param idLot The ID of the lot to refuse
   * @param refusalReason The reason for refusal
   * @return The updated lot
   * @throws ResponseStatusException if the lot is not found or not pending
   */
  @Transactional
  public Lot refuseLot(Long idLot, String refusalReason) {
    Lot lot = findAndValidateLot(idLot, "en attente");
    lot.setLotStatus("refusé");
    lot.setRefusalReason(refusalReason);
    return lotRepository.save(lot);
  }
}