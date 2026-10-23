package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewProductPhoto DTO.
 */
@Data
@NoArgsConstructor
public class NewProductPhoto {

  private Long idPhoto;
  private Long productId; // ID du produit associé
  private String url; // URL de la photo
}