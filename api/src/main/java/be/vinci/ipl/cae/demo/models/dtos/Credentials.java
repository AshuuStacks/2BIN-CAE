package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) for user credentials.
 */
@Data
@NoArgsConstructor
public class Credentials {

  /**
   * The email address of the user.
   */
  private String email;

  /**
   * The last name of the user.
   */
  private String lastname;

  /**
   * The first name of the user.
   */
  private String firstname;

  /**
   * The password of the user.
   */
  private String password;

}