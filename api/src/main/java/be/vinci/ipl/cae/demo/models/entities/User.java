package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User entity.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String firstname;

  @Column(nullable = false)
  private String lastname;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private LocalDateTime creationDate;

  @ManyToOne
  @JoinColumn(name = "id_address", referencedColumnName = "id", nullable = false)
  private Address address; // Relation vers l'adresse.

  @Column(nullable = false)
  private String phonenumber;

  @Column(nullable = false)
  private String civility; // Mr., Mrs., etc.

  @Column(nullable = false)
  private String role;

  @ManyToOne
  @JoinColumn(name = "creator_id", referencedColumnName = "id")
  private User creator; // L'utilisateur qui a créé ce compte

}
