package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for managing reservations, including creation, retrieval, and updates.
 */
@Service
public class ReservationService {

  private final ReservationRepository reservationRepository;

  /**
   * Constructs a ReservationService with the required repository.
   *
   * @param reservationRepository The repository for reservation operations
   */
  public ReservationService(ReservationRepository reservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  /**
   * Creates a new reservation.
   *
   * @param reservation The reservation to create
   * @return The created reservation
   */
  public Reservation createReservation(Reservation reservation) {
    return reservationRepository.save(reservation);
  }

  /**
   * Retrieves reservations for a specific client.
   *
   * @param client The client user
   * @return List of reservations for the client
   */
  public List<Reservation> getReservationsByClient(User client) {
    return reservationRepository.findByClient(client);
  }

  /**
   * Finds a reservation by its ID.
   *
   * @param idReservation The reservation ID
   * @return The reservation, or null if not found
   */
  public Reservation findById(Long idReservation) {
    return reservationRepository.findById(idReservation).orElse(null);
  }

  /**
   * Updates an existing reservation.
   *
   * @param reservation The reservation to update
   * @return The updated reservation, or null if it doesn't exist
   */
  public Reservation updateReservation(Reservation reservation) {
    if (!reservationRepository.existsById(reservation.getIdReservation())) {
      return null;
    }
    return reservationRepository.save(reservation);
  }
}