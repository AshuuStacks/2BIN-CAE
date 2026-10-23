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
 * Address entity.
 */
@Entity
@Table(name = "Products")
@Data
@NoArgsConstructor
public class Product {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String libelleProduct;

  @Column(nullable = false)
  private String description;

  @ManyToOne
  @JoinColumn(name = "id_unite", referencedColumnName = "id", nullable = false)
  private Unite unite;

  @ManyToOne
  @JoinColumn(name = "type_produit", referencedColumnName = "id", nullable = false)
  private ProductType productType;



}

