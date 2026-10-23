package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Unite;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewUser DTO.
 */
@Data
@NoArgsConstructor

public class NewProduit {


  private String libelleProduct;
  private String description;
  private Unite unite;
  private ProductType productType;
}
