package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Address;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewManagerProducer DTO.
 */
@Data
@NoArgsConstructor
public class NewManagerProducer {
  private String email;
  private String lastname;
  private String firstname;
  private String password;
  private String phonenumber;
  private Address address;
  private String civility;
  private String role; // "GESTIONNAIRE" or "PRODUCTEUR"
  private String nomEntreprise; // Required for PRODUCTEUR
}