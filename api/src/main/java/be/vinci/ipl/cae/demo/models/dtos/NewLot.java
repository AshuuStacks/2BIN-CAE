package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object (DTO) for a new lot.
 */
@Data
@NoArgsConstructor
public class NewLot {

  /**
   * The unique identifier of the lot.
   */
  private Long idLot;

  /**
   * The price of the lot.
   */
  private double price;

  /**
   * The initial quantity of items in the lot.
   */
  private int initialQuantity;

  /**
   * The quantity of items sold from the lot.
   */
  private int soldQuantity;

  /**
   * The quantity of items reserved in the lot.
   */
  private int reservedQuantity;

  /**
   * The remaining quantity of items in the lot.
   */
  private int remainingQuantity;

  /**
   * The quantity of items withdrawn from the lot.
   */
  private int withdrawnQuantity;

  /**
   * The status of the lot (e.g., 'pending', 'accepted', 'rejected', 'on sale').
   */
  private String lotStatus;

  /**
   * The date when the lot becomes available.
   */
  private LocalDate availableDate;

  /**
   * The date when the lot was proposed.
   */
  private LocalDate proposalDate;

  /**
   * The date when the lot was received.
   */
  private LocalDate receptionDate;

  /**
   * The ID of the associated product.
   */
  private Long productId;

  /**
   * The ID of the producer associated with the lot.
   */
  private Long producerId;

  /**
   * The ID of the existing photo (optional).
   */
  private Long photoId;

  /**
   * The ID of the responsible person for the lot.
   */
  private Long responsible;

  /**
   * The reason for refusal (if applicable).
   */
  private String refusalReason;
}