package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.User;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * NewProducer DTO.
 */
@Data
@NoArgsConstructor
public class NewProducer {
  private Long userId;
  private String companyName;
  private String email;
  private User user; // Ajout de l'objet User pour correspondre à l'entité
}