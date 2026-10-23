package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;


/**
 * Entité représentant une Reservation dans le système.
 */
@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
public class Reservation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idReservation;

  @ManyToOne
  @JoinColumn(name = "client_id", referencedColumnName = "id", nullable = false)
  // Définit la clé étrangère
  private User client;

  @Column(nullable = false)
  private LocalDate dateReservation;

  @Column(nullable = false)
  private LocalDate dateRecuperation;

  @Column(nullable = false)
  private String etatReservation; // 'reservée', 'annulée', 'abandonnée', 'récupérée'

  @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL)
  @ToString.Exclude
  private List<ReservationLotProduit> reservationLotsProduits;
}