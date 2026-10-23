package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant un Producteur dans le système.
 */
@Entity
@Table(name = "producers")
@Data
@NoArgsConstructor
public class Producer {

  @Id
  @Column(name = "user_id")
  private Long userId;

  @Column(nullable = false)
  private String companyName;

  @Column(nullable = false, unique = true)
  private String email;

  @OneToOne
  @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
  private User user;
}
