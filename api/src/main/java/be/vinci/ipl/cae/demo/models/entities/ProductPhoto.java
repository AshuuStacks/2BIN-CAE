package be.vinci.ipl.cae.demo.models.entities;

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
 * Entité représentant un ProductPhoto dans le système.
 */
@Entity
@Table(name = "product_photos")
@Data
@NoArgsConstructor
public class ProductPhoto {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idPhoto;

  @ManyToOne
  @JoinColumn(name = "product", referencedColumnName = "id", nullable = false)
  private Product product;

  @Column(nullable = false, unique = true)
  private String url;
}