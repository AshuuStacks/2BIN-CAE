package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.User;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * NewReservation DTO.
 */
@Data
@NoArgsConstructor
public class NewReservation {

  private Long idReservation;
  private User client;
  private LocalDate dateReservation;
  private LocalDate dateRecuperation;
  private String etatReservation;
  private List<NewReservationLotProduit> reservationLotsProduits;
}
