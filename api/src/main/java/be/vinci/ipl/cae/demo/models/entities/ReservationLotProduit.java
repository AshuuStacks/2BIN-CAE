package be.vinci.ipl.cae.demo.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant une réservation de lot de produits dans le système.
 */
@Entity
@Table(name = "reservation_lots_produits")
@Data
@NoArgsConstructor
public class ReservationLotProduit {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idReservationLot;

  @ManyToOne
  @JoinColumn(name = "id_reservation", referencedColumnName = "idReservation", nullable = false)
  @JsonIgnore
  private Reservation reservation;

  @ManyToOne
  @JoinColumn(name = "id_lot", referencedColumnName = "idLot", nullable = false)
  private Lot lot;

  @Column(nullable = false)
  private int quantite;
}