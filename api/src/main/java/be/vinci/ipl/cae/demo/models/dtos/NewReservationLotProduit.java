package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Lot;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * New Reservation Lot Produit DTO.
 */
@Data
@NoArgsConstructor

public class NewReservationLotProduit {
  private Long idReservationLot;
  private Reservation reservationId;
  private Lot lotId;
  private int quantite;
}
