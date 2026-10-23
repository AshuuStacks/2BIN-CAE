package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * a lot.
 */
@Entity
@Table(name = "lots")
@Data
@NoArgsConstructor
public class Lot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idLot;

  @Column(nullable = false)
  private double price;

  @Column(nullable = false)
  private int initialQuantity;

  @Column(nullable = false)
  private int soldQuantity = 0;

  @Column(nullable = true)
  private int reservedQuantity = 0;

  @Column(nullable = true)
  private int remainingQuantity = 0;

  @Column(nullable = true)
  private int withdrawnQuantity = 0;

  @Column(nullable = false)
  private String lotStatus; // 'en attente', 'accepté', 'refusé', 'en vente'

  @Column(nullable = false)
  private LocalDate availableDate;

  @Column(nullable = false)
  private LocalDate proposalDate;

  @Column(nullable = true)
  private LocalDate receptionDate;

  @Column(nullable = true)
  private String refusalReason;


  @ManyToOne
  @JoinColumn(name = "product", referencedColumnName = "id", nullable = false)
  private Product product;

  @ManyToOne
  @JoinColumn(name = "producer", referencedColumnName = "user_id", nullable = false)
  private Producer producer;

  @ManyToOne
  @JoinColumn(name = "photo", referencedColumnName = "idPhoto", nullable = false)
  private ProductPhoto photo;
  @ManyToOne
  @JoinColumn(name = "responsible", referencedColumnName = "id", nullable = true)
  private User responsible;

}
