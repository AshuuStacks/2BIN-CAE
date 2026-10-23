package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.dtos.Credentials;
import be.vinci.ipl.cae.demo.models.dtos.NewManagerProducer;
import be.vinci.ipl.cae.demo.models.dtos.NewUser;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.services.UserService;
import java.util.Map;
import java.util.function.Supplier;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * AuthController to handle user authentication and registration.
 */
@RestController
@RequestMapping("/auths")
public class AuthController {

  private final UserService userService;

  /**
   * Constructor for AuthController.
   *
   * @param userService the injected UserService.
   */
  public AuthController(UserService userService) {
    this.userService = userService;
  }

  private boolean isInvalidCredentials(Credentials credentials) {
    return credentials == null
        || credentials.getEmail() == null
        || credentials.getEmail().isBlank()
        || credentials.getPassword() == null
        || credentials.getPassword().isBlank();
  }

  private boolean isInvalidNewUser(NewUser newUser) {
    return isInvalidBaseUser(newUser);
  }

  private boolean isInvalidNewManagerProducer(NewManagerProducer newUser) {
    return isInvalidBaseUser(newUser)
        || newUser.getRole() == null
        || (!"GESTIONNAIRE".equals(newUser.getRole())
        && !"PRODUCTEUR".equals(newUser.getRole()));
  }

  /**
   * Common validation for user DTOs with email and password.
   *
   * @param user the user object to validate.
   * @return true if the user is invalid, false otherwise.
   */
  private boolean isInvalidBaseUser(Object user) {
    if (user == null) {
      return true;
    }
    try {
      String email = (String) user.getClass().getMethod("getEmail").invoke(user);
      String password = (String) user.getClass().getMethod("getPassword").invoke(user);
      return email == null || email.isBlank() || password == null || password.isBlank();
    } catch (Exception e) {
      return true; // If reflection fails, consider the user invalid
    }
  }

  /**
   * Validates the JWT token from the Authorization header and returns the email.
   *
   * @param header the Authorization header containing the JWT token.
   * @return the email extracted from the token.
   * @throws ResponseStatusException if the token is missing or invalid.
   */
  private String validateTokenAndGetEmail(String header) {
    if (header == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token missing");
    }
    String token = header.startsWith("Bearer ")
        ? header.substring(7) : header; // Remove "Bearer " if present
    String email = userService.verifyJwtToken(token);
    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
    return email;
  }

  /**
   * Checks if an email is already in use and throws an exception if it is.
   *
   * @param email the email to check.
   * @throws ResponseStatusException if the email already exists.
   */
  private void checkEmailAvailability(String email) {
    User existingUser = userService.readOneFromEmail(email);
    if (existingUser != null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }
  }

  /**
   * Registers a user and handles the result, returning a specified type.
   *
   * @param registerCall the supplier that performs the
   *                     registration and returns an AuthenticatedUser.
   * @param returnValue the supplier that provides the return value if registration succeeds.
   * @param <T> the type of the return value.
   * @return the specified return value if successful.
   * @throws ResponseStatusException if registration fails due to an existing email.
   */
  private <T> T registerAndHandleResult(Supplier<AuthenticatedUser> registerCall,
      Supplier<T> returnValue) {
    AuthenticatedUser user = registerCall.get();
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }
    return returnValue.get();
  }

  /**
   * Register a new user.
   *
   * @param newUser the user credentials from the request body.
   * @return the authenticated user.
   */
  @PostMapping("/register")
  public NewUser register(@RequestBody NewUser newUser) {
    if (isInvalidNewUser(newUser)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
    checkEmailAvailability(newUser.getEmail());

    return registerAndHandleResult(
        () -> userService.register(newUser.getEmail(), newUser.getFirstname(),
            newUser.getLastname(), newUser.getPassword(),
            newUser.getPhonenumber(), newUser.getAddress(),
            newUser.getCivility(), newUser.getCreator(), newUser.getRole()),
        () -> newUser
    );
  }

  /**
   * Login a user.
   *
   * @param credentials the user credentials from the request body.
   * @return the authenticated user.
   */
  @PostMapping("/login")
  public AuthenticatedUser login(@RequestBody Credentials credentials) {
    if (isInvalidCredentials(credentials)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }

    AuthenticatedUser user = userService.login(credentials.getEmail(),
        credentials.getPassword());

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  /**
   * Validate the JWT token and get the authenticated user.
   *
   * @param header the Authorization header containing the JWT token.
   * @return the authenticated user.
   */
  @GetMapping("/validate-token")
  public AuthenticatedUser getAuthenticatedUser(@RequestHeader("Authorization") String header) {
    String email = validateTokenAndGetEmail(header);

    AuthenticatedUser authenticatedUser = userService.getAuthenticatedUser(email);
    if (authenticatedUser == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    return authenticatedUser;
  }

  /**
   * Update the user's password.
   *
   * @param header the Authorization header containing the JWT token.
   * @param requestBody the raw JSON body containing oldPassword and newPassword.
   * @return the updated authenticated user.
   */
  @PutMapping("/password")
  public AuthenticatedUser updatePassword(
      @RequestHeader("Authorization") String header,
      @RequestBody Map<String, String> requestBody) {
    String email = validateTokenAndGetEmail(header);

    String oldPassword = requestBody.get("oldPassword");
    String newPassword = requestBody.get("password");

    if (oldPassword == null || oldPassword.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password cannot be empty");
    }
    if (newPassword == null || newPassword.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password cannot be empty");
    }

    try {
      userService.updatePassword(email, oldPassword, newPassword);
    } catch (ResponseStatusException e) {
      System.out.println("Error while updating password: " + e.getMessage());
      throw e;
    }
    AuthenticatedUser updatedUser = userService.getAuthenticatedUser(email);
    if (updatedUser == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found after update");
    }

    return updatedUser;
  }

  /**
   * Register a new producer or manager.
   *
   * @param newUser the user credentials from the request body.
   * @return the authenticated user.
   */
  @PostMapping("/register-manager-producer")
  @PreAuthorize("hasAuthority('GESTIONNAIRE')")
  public AuthenticatedUser registerManagerOrProducer(@RequestHeader("Authorization") String header,
      @RequestBody NewManagerProducer newUser) {
    String creatorEmail = validateTokenAndGetEmail(header);

    if (isInvalidNewManagerProducer(newUser)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid data");
    }
    checkEmailAvailability(newUser.getEmail());

    NewManagerProducer userData = newUser;
    AuthenticatedUser user = userService.registerManagerOrProducer(
        userData.getEmail(),
        userData.getFirstname(),
        userData.getLastname(),
        userData.getPassword(),
        userData.getPhonenumber(),
        userData.getAddress(),
        userData.getCivility(),
        userData.getRole(),
        userData.getNomEntreprise(),
        creatorEmail
    );

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }
    return user;
  }
}