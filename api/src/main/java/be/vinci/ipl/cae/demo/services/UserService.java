package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.time.LocalDateTime;
import java.util.Date;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service for managing users, including authentication, registration, and updates.
 */
@Service
public class UserService {

  private static final String jwtSecret = "ilovemypizza!";
  private static final long lifetimeJwt = 24 * 60 * 60 * 1000; // 24 hours
  private static final Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
  private final BCryptPasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final AddressRepository addressRepository;
  private final ProducerRepository producerRepository;

  /**
   * Constructor for UserService.
   *
   * @param passwordEncoder  the password encoder
   * @param userRepository   the user repository
   * @param addressRepository the address repository
   * @param producerRepository the producer repository
   */
  public UserService(BCryptPasswordEncoder passwordEncoder, UserRepository userRepository,
      AddressRepository addressRepository, ProducerRepository producerRepository) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
    this.addressRepository = addressRepository;
    this.producerRepository = producerRepository;
  }

  /**
   * Creates a JWT token for a user.
   *
   * @param email the email to include in the claim
   * @param generateToken whether to generate a token
   * @return the authenticated user with or without a token
   */
  public AuthenticatedUser createJwtToken(String email, boolean generateToken) {
    User user = userRepository.findUserByEmail(email);
    if (user == null) {
      return null;
    }
    String token = null;
    if (generateToken) {
      token = JWT.create()
          .withIssuer("auth0")
          .withClaim("email", email)
          .withClaim("role", user.getRole())
          .withIssuedAt(new Date())
          .withExpiresAt(new Date(System.currentTimeMillis() + lifetimeJwt))
          .sign(algorithm);
    }
    AuthenticatedUser authenticatedUser = new AuthenticatedUser();
    authenticatedUser.setId(user.getId());
    authenticatedUser.setEmail(email);
    authenticatedUser.setFirstname(user.getFirstname());
    authenticatedUser.setLastname(user.getLastname());
    authenticatedUser.setPhonenumber(user.getPhonenumber());
    authenticatedUser.setRole(user.getRole());
    authenticatedUser.setId(user.getId());
    if (generateToken) {
      authenticatedUser.setToken(token);
    }
    if (user.getAddress() != null) {
      Address addressDto = new Address();
      addressDto.setStreet(user.getAddress().getStreet());
      addressDto.setNumber(user.getAddress().getNumber());
      addressDto.setMailbox(user.getAddress().getMailbox());
      addressDto.setPostalcode(user.getAddress().getPostalcode());
      addressDto.setCity(user.getAddress().getCity());
      addressDto.setCountry(user.getAddress().getCountry());
      authenticatedUser.setAddress(addressDto);
    }
    if (user.getCreationDate() != null) {
      authenticatedUser.setCreationDate(user.getCreationDate().toString());
    }
    return authenticatedUser;
  }

  /**
   * Verifies a JWT token.
   *
   * @param token the token to verify
   * @return the email if the token is valid, null otherwise
   */
  public String verifyJwtToken(String token) {
    try {
      return JWT.require(algorithm).build().verify(token).getClaim("email").asString();
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Logs in a user.
   *
   * @param email    the email
   * @param password the password
   * @return the authenticated user if the login is successful, null otherwise
   */
  public AuthenticatedUser login(String email, String password) {
    User user = userRepository.findUserByEmail(email);
    if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
      return null;
    }
    return createJwtToken(email, true);
  }

  /**
   * Registers a new user.
   *
   * @param email       the email
   * @param firstname   the firstname
   * @param lastname    the lastname
   * @param password    the password
   * @param phonenumber the phone number
   * @param address     the address
   * @param civility    the civility
   * @param creator     the creator of the account if it exists, null otherwise
   * @param role        the role
   * @return the authenticated user if the registration is successful, null otherwise
   */
  public AuthenticatedUser register(String email, String firstname, String lastname,
      String password, String phonenumber,
      Address address, String civility, User creator,
      String role) {
    if (userRepository.findUserByEmail(email) != null) {
      return null;
    }
    createOne(email, firstname, lastname, password, phonenumber, address, civility, creator, role);
    return createJwtToken(email, false);
  }

  /**
   * Reads a user by email.
   *
   * @param email the email
   * @return the user if it exists, null otherwise
   */
  public User readOneFromEmail(String email) {
    return userRepository.findUserByEmail(email);
  }

  /**
   * Creates a new user.
   *
   * @param email       the email
   * @param firstname   the firstname
   * @param lastname    the lastname
   * @param password    the password
   * @param phoneNumber the phone number
   * @param address     the address
   * @param civility    the civility
   * @param creator     the creator of the account if it exists, null otherwise
   * @param role        the role
   */
  public void createOne(String email, String firstname, String lastname,
      String password, String phoneNumber,
      Address address, String civility, User creator,
      String role) {
    String hashedPassword = passwordEncoder.encode(password);
    Address savedAddress = addressRepository.save(address);
    User user = new User();
    user.setEmail(email);
    user.setFirstname(firstname);
    user.setLastname(lastname);
    user.setPassword(hashedPassword);
    user.setPhonenumber(phoneNumber);
    user.setCreationDate(LocalDateTime.now());
    user.setCivility(civility);
    user.setAddress(savedAddress);
    user.setRole(role);
    user.setCreator(creator);
    userRepository.save(user);
  }

  /**
   * Gets an authenticated user based on the email.
   *
   * @param email the email
   * @return the authenticated user
   */
  public AuthenticatedUser getAuthenticatedUser(String email) {
    User user = userRepository.findUserByEmail(email);
    if (user == null) {
      return null;
    }
    return createJwtToken(email, true);
  }

  /**
   * Finds a user by its id.
   *
   * @param id the id of the user
   * @return the user
   */
  public User getUserById(Long id) {
    return userRepository.findUserById(id);
  }

  /**
   * Updates the user's password.
   *
   * @param email      the email
   * @param oldPassword the old password to verify
   * @param newPassword the new password
   * @throws ResponseStatusException if the old password is incorrect, user not found,
   * or new password is the same as the old one
   */
  public void updatePassword(String email, String oldPassword, String newPassword) {
    User user = userRepository.findUserByEmail(email);
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }
    if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect old password");
    }
    if (passwordEncoder.matches(newPassword, user.getPassword())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "New password cannot be the same as the old password");
    }
    String hashedPassword = passwordEncoder.encode(newPassword);
    user.setPassword(hashedPassword);
    userRepository.save(user);
  }

  /**
   * Registers a new manager or producer.
   *
   * @param email       the email
   * @param firstname   the firstname
   * @param lastname    the lastname
   * @param password    the password
   * @param phonenumber the phone number
   * @param address     the address
   * @param civility    the civility
   * @param role        the role
   * @param nomEntreprise the company name (required for producer)
   * @param creatorEmail the email of the creator
   * @return the authenticated user if the registration is successful, null if email exists
   * @throws IllegalArgumentException if nomEntreprise is missing for a producer
   * @throws ResponseStatusException if an error occurs during producer creation
   */
  public AuthenticatedUser registerManagerOrProducer(String email, String firstname,
      String lastname, String password,
      String phonenumber, Address address,
      String civility, String role,
      String nomEntreprise, String creatorEmail) {
    if (userRepository.findUserByEmail(email) != null) {
      return null;
    }

    // Create the user
    User user = new User();
    String hashedPassword = passwordEncoder.encode(password);
    Address savedAddress = addressRepository.save(address);
    user.setEmail(email);
    user.setFirstname(firstname);
    user.setLastname(lastname);
    user.setPassword(hashedPassword);
    user.setPhonenumber(phonenumber);
    user.setCreationDate(LocalDateTime.now());
    user.setCivility(civility);
    user.setAddress(savedAddress);
    user.setRole(role);
    User creator = readOneFromEmail(creatorEmail);
    user.setCreator(creator);
    User savedUser = userRepository.save(user);

    // Specific handling for producer
    if ("PRODUCTEUR".equals(role)) {
      if (nomEntreprise == null || nomEntreprise.isBlank()) {
        throw new IllegalArgumentException("Company name is required for a producer");
      }
      try {
        Producer producer = new Producer();
        producer.setUserId(savedUser.getId());
        producer.setCompanyName(nomEntreprise);
        producer.setEmail(email);
        producerRepository.save(producer);
      } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Erreur lors de la sauvegarde du producteur : "
                        + e.getMessage(), e); // Ajout de la cause
      }
    }

    return createJwtToken(email, false);
  }
}