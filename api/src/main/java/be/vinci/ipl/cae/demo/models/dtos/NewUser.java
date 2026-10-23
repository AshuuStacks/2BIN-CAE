package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.User;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewUser DTO.
 */
@Data
@NoArgsConstructor
public class NewUser {

  private String email;
  private String lastname;
  private String firstname;
  private String password;
  private String phonenumber;
  private Address address;
  private String civility;
  private String role;
  private User creator;
}