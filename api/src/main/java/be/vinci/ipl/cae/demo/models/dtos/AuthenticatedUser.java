package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Address;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) for an authenticated user.
 */
@Data
@NoArgsConstructor
public class AuthenticatedUser {

  /**
   * The unique identifier of the user.
   */
  private long id;

  /**
   * The email address of the user.
   */
  private String email;

  /**
   * The first name of the user.
   */
  private String firstname;

  /**
   * The last name of the user.
   */
  private String lastname;

  /**
   * The phone number of the user.
   */
  private String phonenumber;

  /**
   * The authentication token of the user.
   */
  private String token;

  /**
   * The role of the user (e.g., CLIENT, ADMIN).
   */
  private String role;

  /**
   * The address of the user.
   */
  private Address address;

  /**
   * The creation date of the user as a string.
   */
  private String creationDate;
}