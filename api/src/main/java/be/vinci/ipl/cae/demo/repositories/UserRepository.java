package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing User entities.
 */
@Repository
public interface UserRepository extends CrudRepository<User, Long> {

  /**
   * Finds a user by their email.
   *
   * @param email the email of the user
   * @return the user with the specified email, or null if not found
   */
  User findUserByEmail(String email);

  /**
   * Finds a user by their ID.
   *
   * @param id the ID of the user
   * @return the user with the specified ID, or null if not found
   */
  User findUserById(Long id);
}