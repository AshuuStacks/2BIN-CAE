package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewLot;
import be.vinci.ipl.cae.demo.models.dtos.RefusalReason;
import be.vinci.ipl.cae.demo.models.entities.Lot;
import be.vinci.ipl.cae.demo.services.LotService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * Contrôleur pour la gestion des lots.
 */
@RestController
@RequestMapping("/lots")
public class LotController {

  private final LotService lotService;

  /**
   * Constructeur injectant le service de gestion des lots.
   *
   * @param lotService service lié aux lots
   */
  public LotController(LotService lotService) {
    this.lotService = lotService;
  }

  /**
   * Récupère tous les lots disponibles.
   *
   * @return liste des lots disponibles
   */
  @GetMapping("/available")
  public ResponseEntity<List<Lot>> getAvailableLots() {
    try {
      List<Lot> lots = lotService.getAvailableLots();
      return ResponseEntity.ok(lots);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors de la récupération des lots disponibles", e);
    }
  }

  /**
   * Récupère tous les lots, peu importe leur statut.
   *
   * @return liste complète des lots
   */
  @GetMapping("/all")
  public ResponseEntity<List<Lot>> getAllLots() {
    try {
      List<Lot> lots = lotService.getAllLots();
      return ResponseEntity.ok(lots);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors de la récupération des lots", e);
    }
  }

  /**
   * Récupère les lots récemment ajoutés.
   *
   * @return liste des lots récents
   */
  @GetMapping("/recent")
  public ResponseEntity<List<Lot>> getRecentLots() {
    return ResponseEntity.ok(lotService.getRecentLots());
  }

  /**
   * Récupère les photos associées à un produit donné.
   *
   * @param productId identifiant du produit
   * @return liste des photos liées
   */
  @GetMapping("/photos/{productId}")
  public ResponseEntity<List<Object>> getPhotosByProductId(@PathVariable Long productId) {
    try {
      if (productId == null || productId <= 0) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID de produit invalide");
      }
      List<Object> photos = lotService.getPhotosByProductId(productId);
      return ResponseEntity.ok(photos);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors de la récupération des photos", e);
    }
  }

  /**
   * Ajoute un nouveau lot.
   *
   * @param newLot données du nouveau lot
   * @param image  fichier image optionnel
   * @return le lot ajouté
   */
  @PostMapping("/add")
  public ResponseEntity<Lot> addLot(
      @RequestPart("newLot") NewLot newLot,
      @RequestPart(value = "image", required = false) MultipartFile image) {

    if (newLot == null
        || newLot.getPrice() <= 0
        || newLot.getInitialQuantity() <= 0
        || newLot.getProductId() == null
        || newLot.getProducerId() == null
        || newLot.getLotStatus() == null
        || newLot.getLotStatus().isBlank()
        || newLot.getAvailableDate() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Données de lot invalides");
    }

    if (image == null && newLot.getPhotoId() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Une image ou un ID de photo est requis");
    }

    if (newLot.getIdLot() != null) {
      Lot existingLot = lotService.readOneFromLotId(newLot.getIdLot());
      if (existingLot != null) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Lot déjà existant");
      }
    }

    try {
      Lot addedLot = lotService.addLot(newLot, image);
      if (addedLot == null) {
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
            "Lot non créé");
      }
      return ResponseEntity.status(HttpStatus.CREATED).body(addedLot);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors de la création du lot", e);
    }
  }

  /**
   * Récupère un lot via son identifiant.
   *
   * @param idLot identifiant du lot
   * @return le lot correspondant
   */
  @GetMapping("/{idLot}")
  public ResponseEntity<Lot> getLotById(@PathVariable long idLot) {
    try {
      Lot lot = lotService.readOneFromLotId(idLot);
      if (lot == null) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot non trouvé");
      }
      return ResponseEntity.ok(lot);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors de la récupération du lot", e);
    }
  }

  /**
   * Récupère les lots en attente ou acceptés.
   *
   * @return liste des lots en cours de traitement
   */
  @GetMapping("/pending")
  public ResponseEntity<List<Lot>> getPendingLots() {
    try {
      List<Lot> lots = lotService.getPendingOrAcceptedLots();
      return ResponseEntity.ok(lots);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors de la récupération des lots", e);
    }
  }

  /**
   * Accepte un lot.
   *
   * @param idLot identifiant du lot
   * @return le lot mis à jour
   */
  @PutMapping("/accept/{idLot}")
  public ResponseEntity<Lot> acceptLot(@PathVariable long idLot) {
    try {
      Lot lot = lotService.acceptLot(idLot);
      return ResponseEntity.ok(lot);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors de l'acceptation du lot", e);
    }
  }

  /**
   * Marque un lot comme reçu.
   *
   * @param idLot identifiant du lot
   * @return le lot mis à jour
   */
  @PutMapping("/receive/{idLot}")
  public ResponseEntity<Lot> receiveLot(@PathVariable long idLot) {
    try {
      Lot lot = lotService.receiveLot(idLot);
      return ResponseEntity.ok(lot);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors de la réception du lot", e);
    }
  }

  /**
   * Refuse un lot avec une raison.
   *
   * @param idLot identifiant du lot
   * @param refusalReasonDto DTO contenant la raison du refus
   * @return le lot mis à jour
   */
  @PutMapping("/refuse/{idLot}")
  public ResponseEntity<Lot> refuseLot(
      @PathVariable long idLot,
      @RequestBody RefusalReason refusalReasonDto) {
    try {
      if (refusalReasonDto == null || refusalReasonDto.getRefusalReason() == null
          || refusalReasonDto.getRefusalReason().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "La raison du refus est requise");
      }
      Lot lot = lotService.refuseLot(idLot, refusalReasonDto.getRefusalReason());
      return ResponseEntity.ok(lot);
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Erreur lors du refus du lot", e);
    }
  }
}
