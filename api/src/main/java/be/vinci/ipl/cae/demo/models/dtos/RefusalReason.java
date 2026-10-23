package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Refuser  un lot comme message.
 */
@Data
@NoArgsConstructor
public class RefusalReason {
  private String refusalReason;
}