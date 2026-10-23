package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.NewReservation;
import be.vinci.ipl.cae.demo.models.entities.Lot;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.ReservationLotProduit;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.LotService;
import be.vinci.ipl.cae.demo.services.ReservationService;
import be.vinci.ipl.cae.demo.services.UserService;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for handling reservation-related operations.
 */
@RestController
@RequestMapping("/reservations")
public class ReservationController {

  private final ReservationService reservationService;
  private final UserService userService;
  private final LotService lotService;

  /**
   * Constructs a ReservationController with required services.
   *
   * @param reservationService Service for reservation operations
   * @param userService Service for user operations
   * @param lotService Service for lot operations
   */
  public ReservationController(ReservationService reservationService, UserService userService,
      LotService lotService) {
    this.reservationService = reservationService;
    this.userService = userService;
    this.lotService = lotService;
  }

  /**
   * Authenticates a user via JWT token and ensures they are a client.
   *
   * @param token The Authorization header containing the JWT token
   * @return The authenticated client user
   * @throws ResponseStatusException if authentication fails or user is not a client
   */
  private User authenticateAndAuthorizeClient(String token) {
    String tokenWithoutBearer = token.startsWith("Bearer ") ? token.substring(7) : token;
    String email = userService.verifyJwtToken(tokenWithoutBearer);
    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié");
    }
    User user = userService.readOneFromEmail(email);
    if (user == null || !"CLIENT".equals(user.getRole())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès réservé aux clients");
    }
    return user;
  }

  /**
   * Updates lot quantities for a reservation's lots.
   *
   * @param reservation The reservation containing lots
   * @param addQuantities Whether to add (true) or subtract (false) quantities
   * @param throwOnNullLot Whether to throw an exception if a lot is not found
   * @param dateRecuperation The recovery date for availability validation (optional)
   * @throws ResponseStatusException if validation fails
   */
  private void updateLotQuantities(Reservation reservation, boolean addQuantities,
      boolean throwOnNullLot, LocalDate dateRecuperation) {
    for (ReservationLotProduit rlp : reservation.getReservationLotsProduits()) {
      Lot lot = lotService.readOneFromLotId(rlp.getLot().getIdLot());
      if (lot == null) {
        if (throwOnNullLot) {
          throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lot non trouvé");
        }
        continue;
      }
      if (throwOnNullLot) {
        if (lot.getRemainingQuantity() < rlp.getQuantite()) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
              "Quantité demandée supérieure à la quantité restante");
        }
        if (dateRecuperation != null && lot.getAvailableDate().isAfter(dateRecuperation)) {
          throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
              "La date de récupération doit être postérieure ou égale à la "
                  + "date de disponibilité du lot");
        }
      }
      int quantityChange = addQuantities ? rlp.getQuantite() : -rlp.getQuantite();
      lot.setReservedQuantity(lot.getReservedQuantity() + quantityChange);
      lot.setRemainingQuantity(lot.getRemainingQuantity() - quantityChange);
      lotService.updateLot(lot);
    }
  }

  /**
   * Creates a new reservation.
   *
   * @param newReservation The reservation details
   * @param token The Authorization header with JWT token
   * @return The created reservation
   * @throws ResponseStatusException if creation fails
   */
  @PostMapping
  public ResponseEntity<Reservation> createReservation(@RequestBody NewReservation newReservation,
      @RequestHeader("Authorization") String token) {
    User user = authenticateAndAuthorizeClient(token);

    if (newReservation.getDateRecuperation().isBefore(newReservation.getDateReservation())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "La date de récupération doit être postérieure ou égale à la date de réservation");
    }

    // Convert DTO to entity
    Reservation reservation = new Reservation();
    reservation.setClient(user);
    reservation.setDateReservation(newReservation.getDateReservation());
    reservation.setDateRecuperation(newReservation.getDateRecuperation());
    reservation.setEtatReservation(newReservation.getEtatReservation());
    reservation.setReservationLotsProduits(
        newReservation.getReservationLotsProduits().stream()
            .map(dto -> {
              ReservationLotProduit rlp = new ReservationLotProduit();
              rlp.setReservation(reservation);
              rlp.setLot(dto.getLotId());
              rlp.setQuantite(dto.getQuantite());
              return rlp;
            })
            .collect(Collectors.toList())
    );

    // Update lot quantities
    updateLotQuantities(reservation, true, true, reservation.getDateRecuperation());

    Reservation createdReservation = reservationService.createReservation(reservation);
    return ResponseEntity.ok(createdReservation);
  }

  /**
   * Retrieves reservations for a client by client ID.
   *
   * @param clientId The client user
   * @return List of reservations for the client
   * @throws ResponseStatusException if client not found
   */
  @GetMapping("/client/{clientId}")
  public ResponseEntity<List<Reservation>> getReservationsByClient(@PathVariable User clientId) {
    User user = userService.getUserById(clientId.getId());
    List<Reservation> reservations = reservationService.getReservationsByClient(user);

    return ResponseEntity.ok(reservations);
  }

  /**
   * Retrieves a reservation by ID, ensuring the client has access.
   *
   * @param idReservation The reservation ID
   * @param token The Authorization header with JWT token
   * @return The reservation
   * @throws ResponseStatusException if reservation not found or access denied
   */
  @GetMapping("/{idReservation}")
  public ResponseEntity<Reservation> getReservationById(
      @PathVariable Long idReservation,
      @RequestHeader("Authorization") String token) {
    Reservation reservation = reservationService.findById(idReservation);
    if (reservation == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation non trouvée");
    }

    return ResponseEntity.ok(reservation);
  }

  /**
   * Cancels a reservation by ID, ensuring the client has access.
   *
   * @param idReservation The reservation ID
   * @param token The Authorization header with JWT token
   * @return The updated reservation
   * @throws ResponseStatusException if reservation not found, already cancelled, or access denied
   */
  @PatchMapping("/{idReservation}/cancel")
  public ResponseEntity<Reservation> cancelReservation(
      @PathVariable Long idReservation,
      @RequestHeader("Authorization") String token) {
    User user = authenticateAndAuthorizeClient(token);

    Reservation reservation = reservationService.findById(idReservation);
    if (reservation == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation non trouvée");
    }
    if (!reservation.getClient().getId().equals(user.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Accès non autorisé à cette réservation");
    }
    if ("Annulée".equals(reservation.getEtatReservation())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "La réservation est déjà annulée");
    }

    // Update lot quantities
    updateLotQuantities(reservation, false, false, null);

    // Update reservation state
    reservation.setEtatReservation("CANCELLED");
    Reservation updatedReservation = reservationService.updateReservation(reservation);

    return ResponseEntity.ok(updatedReservation);
  }
}