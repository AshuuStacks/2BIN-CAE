package be.vinci.ipl.cae;

import be.vinci.ipl.cae.demo.models.dtos.AuthenticatedUser;
import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.AddressRepository;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import be.vinci.ipl.cae.demo.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService aligned with actual implementation.
 * This class tests the core functionality of UserService using Mockito to mock dependencies.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    private static final String EXISTING_EMAIL = "test@example.com";
    private static final String NEW_EMAIL = "new@example.com";
    private static final String PASSWORD = "password";
    private static final String HASHED_PASSWORD = "hashed_password";
    private static final String FIRSTNAME = "John";
    private static final String LASTNAME = "Doe";
    private static final String PHONE_NUMBER = "123456789";
    private static final String CIVILITY = "Mr.";
    private static final String ROLE = "CLIENT";
    private static final String CREATOR_EMAIL = "creator@example.com";

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProducerRepository producerRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User existingUser;
    private Address address;

    @BeforeEach
    void setUp() {
        existingUser = new User();
        existingUser.setId(1L); // Ajout d'un ID pour simuler un utilisateur existant
        existingUser.setEmail(EXISTING_EMAIL);
        existingUser.setFirstname(FIRSTNAME);
        existingUser.setLastname(LASTNAME);
        existingUser.setPhonenumber(PHONE_NUMBER);
        existingUser.setPassword(HASHED_PASSWORD);
        existingUser.setCreationDate(LocalDateTime.now());
        existingUser.setCivility(CIVILITY);
        existingUser.setRole(ROLE);

        address = new Address();
        address.setStreet("123 Main St");
        address.setNumber("1");
        address.setPostalcode("1000");
        address.setCity("Brussels");
        address.setCountry("Belgium");
        existingUser.setAddress(address);
    }

    @Test
    void createJwtTokenShouldReturnAuthenticatedUserWithoutTokenWhenGenerateTokenIsFalse() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(existingUser);

        AuthenticatedUser result = userService.createJwtToken(EXISTING_EMAIL, false);

        assertAll(
                () -> assertEquals(EXISTING_EMAIL, result.getEmail()),
                () -> assertEquals(FIRSTNAME, result.getFirstname()),
                () -> assertEquals(LASTNAME, result.getLastname()),
                () -> assertEquals(PHONE_NUMBER, result.getPhonenumber()),
                () -> assertEquals(ROLE, result.getRole()),
                () -> assertNull(result.getToken())
        );
    }

    @Test
    void createJwtTokenShouldReturnAuthenticatedUserWithTokenWhenGenerateTokenIsTrue() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(existingUser);

        AuthenticatedUser result = userService.createJwtToken(EXISTING_EMAIL, true);

        assertAll(
                () -> assertEquals(EXISTING_EMAIL, result.getEmail()),
                () -> assertEquals(FIRSTNAME, result.getFirstname()),
                () -> assertEquals(LASTNAME, result.getLastname()),
                () -> assertEquals(PHONE_NUMBER, result.getPhonenumber()),
                () -> assertEquals(ROLE, result.getRole()),
                () -> assertNotNull(result.getToken())
        );
    }

    @Test
    void createJwtTokenShouldReturnNullWhenUserDoesNotExist() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(null);

        AuthenticatedUser result = userService.createJwtToken(EXISTING_EMAIL, false);

        assertNull(result);
    }

    @Test
    void verifyJwtTokenShouldReturnEmailWhenTokenIsValid() {
        String token = com.auth0.jwt.JWT.create()
                .withClaim("email", EXISTING_EMAIL)
                .withIssuer("auth0")
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("ilovemypizza!"));

        String result = userService.verifyJwtToken(token);

        assertEquals(EXISTING_EMAIL, result);
    }

    @Test
    void verifyJwtTokenShouldReturnNullWhenTokenIsInvalid() {
        String result = userService.verifyJwtToken("invalid.token");

        assertNull(result);
    }

    @Test
    void verifyJwtTokenShouldReturnNullWhenTokenIsExpired() {
        String expiredToken = com.auth0.jwt.JWT.create()
                .withClaim("email", EXISTING_EMAIL)
                .withIssuer("auth0")
                .withExpiresAt(new Date(System.currentTimeMillis() - 1000))
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256("ilovemypizza!"));

        String result = userService.verifyJwtToken(expiredToken);

        assertNull(result);
    }

    @Test
    void loginShouldReturnAuthenticatedUserWhenCredentialsAreCorrect() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(existingUser);
        when(passwordEncoder.matches(PASSWORD, HASHED_PASSWORD)).thenReturn(true);

        AuthenticatedUser result = userService.login(EXISTING_EMAIL, PASSWORD);

        assertAll(
                () -> assertEquals(EXISTING_EMAIL, result.getEmail()),
                () -> assertEquals(FIRSTNAME, result.getFirstname()),
                () -> assertEquals(LASTNAME, result.getLastname()),
                () -> assertEquals(PHONE_NUMBER, result.getPhonenumber()),
                () -> assertEquals(ROLE, result.getRole()),
                () -> assertNotNull(result.getToken())
        );
    }

    @Test
    void loginShouldReturnNullWhenPasswordIsIncorrect() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(existingUser);
        when(passwordEncoder.matches("wrongPassword", HASHED_PASSWORD)).thenReturn(false);

        AuthenticatedUser result = userService.login(EXISTING_EMAIL, "wrongPassword");

        assertNull(result);
    }

    @Test
    void loginShouldReturnNullWhenUserDoesNotExist() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(null);

        AuthenticatedUser result = userService.login(EXISTING_EMAIL, PASSWORD);

        assertNull(result);
    }

    @Test
    void registerShouldReturnAuthenticatedUserWhenRegistrationIsSuccessful() {
        User newUser = new User();
        newUser.setId(2L); // Ajout d'un ID
        newUser.setEmail(NEW_EMAIL);
        newUser.setFirstname(FIRSTNAME);
        newUser.setLastname(LASTNAME);
        newUser.setPhonenumber(PHONE_NUMBER);
        newUser.setPassword(HASHED_PASSWORD);
        newUser.setAddress(address);
        newUser.setCivility(CIVILITY);
        newUser.setRole(ROLE);
        newUser.setCreationDate(LocalDateTime.now());
        newUser.setId(2L);

        when(userRepository.findUserByEmail(NEW_EMAIL)).thenReturn(null).thenReturn(newUser);
        when(passwordEncoder.encode(PASSWORD)).thenReturn(HASHED_PASSWORD);
        when(addressRepository.save(address)).thenReturn(address);
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        AuthenticatedUser result = userService.register(NEW_EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE_NUMBER, address, CIVILITY, null, ROLE);

        assertAll(
                () -> assertEquals(NEW_EMAIL, result.getEmail()),
                () -> assertEquals(FIRSTNAME, result.getFirstname()),
                () -> assertEquals(LASTNAME, result.getLastname()),
                () -> assertEquals(PHONE_NUMBER, result.getPhonenumber()),
                () -> assertEquals(ROLE, result.getRole()),
                () -> assertNull(result.getToken())
        );

        verify(userRepository, times(1)).save(argThat(user ->
                user.getEmail().equals(NEW_EMAIL) &&
                        user.getFirstname().equals(FIRSTNAME) &&
                        user.getPassword().equals(HASHED_PASSWORD) &&
                        user.getAddress() == address &&
                        user.getCivility().equals(CIVILITY) &&
                        user.getRole().equals(ROLE) &&
                        user.getCreationDate() != null
        ));
        verify(addressRepository, times(1)).save(address);
    }

    @Test
    void registerShouldReturnNullWhenEmailAlreadyExists() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(existingUser);

        AuthenticatedUser result = userService.register(EXISTING_EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE_NUMBER, address, CIVILITY, null, ROLE);

        assertNull(result);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void readOneFromEmailShouldReturnUserWhenUserExists() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(existingUser);

        User result = userService.readOneFromEmail(EXISTING_EMAIL);

        assertEquals(EXISTING_EMAIL, result.getEmail());
    }

    @Test
    void readOneFromEmailShouldReturnNullWhenUserDoesNotExist() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(null);

        User result = userService.readOneFromEmail(EXISTING_EMAIL);

        assertNull(result);
    }

    @Test
    void createOneShouldSaveUserWithCorrectData() {
        when(passwordEncoder.encode(PASSWORD)).thenReturn(HASHED_PASSWORD);
        when(addressRepository.save(address)).thenReturn(address);

        userService.createOne(NEW_EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE_NUMBER, address, CIVILITY, null, ROLE);

        verify(userRepository, times(1)).save(argThat(user ->
                user.getEmail().equals(NEW_EMAIL) &&
                        user.getFirstname().equals(FIRSTNAME) &&
                        user.getLastname().equals(LASTNAME) &&
                        user.getPassword().equals(HASHED_PASSWORD) &&
                        user.getPhonenumber().equals(PHONE_NUMBER) &&
                        user.getCivility().equals(CIVILITY) &&
                        user.getAddress() == address &&
                        user.getRole().equals(ROLE) &&
                        user.getCreationDate() != null
        ));
        verify(addressRepository, times(1)).save(address);
    }

    @Test
    void getAuthenticatedUserShouldReturnAuthenticatedUserWithTokenWhenUserExists() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(existingUser);

        AuthenticatedUser result = userService.getAuthenticatedUser(EXISTING_EMAIL);

        assertAll(
                () -> assertEquals(EXISTING_EMAIL, result.getEmail()),
                () -> assertEquals(FIRSTNAME, result.getFirstname()),
                () -> assertEquals(LASTNAME, result.getLastname()),
                () -> assertEquals(PHONE_NUMBER, result.getPhonenumber()),
                () -> assertEquals(ROLE, result.getRole()),
                () -> assertNotNull(result.getToken())
        );
    }

    @Test
    void getAuthenticatedUserShouldReturnNullWhenUserDoesNotExist() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(null);

        AuthenticatedUser result = userService.getAuthenticatedUser(EXISTING_EMAIL);

        assertNull(result);
    }

    private User setupCommonMocksForRegister(String role, String creatorEmail) {
        User savedUser = new User();
        savedUser.setId(1L); // Ajout d'un ID pour simuler une sauvegarde
        savedUser.setEmail(UserServiceTest.NEW_EMAIL);
        savedUser.setFirstname(FIRSTNAME);
        savedUser.setLastname(LASTNAME);
        savedUser.setPhonenumber(PHONE_NUMBER);
        savedUser.setPassword(HASHED_PASSWORD);
        savedUser.setAddress(address);
        savedUser.setCivility(CIVILITY);
        savedUser.setRole(role);
        savedUser.setCreationDate(LocalDateTime.now());

        when(userRepository.findUserByEmail(UserServiceTest.NEW_EMAIL)).thenReturn(null).thenReturn(savedUser);
        when(passwordEncoder.encode(PASSWORD)).thenReturn(HASHED_PASSWORD);
        when(addressRepository.save(address)).thenReturn(address);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userRepository.findUserByEmail(creatorEmail)).thenReturn(null);

        return savedUser;
    }

    @Test
    void registerManagerOrProducerShouldRegisterManagerSuccessfully() {
        setupCommonMocksForRegister("GESTIONNAIRE", CREATOR_EMAIL);

        AuthenticatedUser result = userService.registerManagerOrProducer(
                NEW_EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE_NUMBER, address, CIVILITY,
                "GESTIONNAIRE", null, CREATOR_EMAIL
        );

        assertNotNull(result);
        assertEquals(NEW_EMAIL, result.getEmail());
        assertEquals("GESTIONNAIRE", result.getRole());
        assertNull(result.getToken());
        verify(producerRepository, never()).save(any());
    }

    @Test
    void registerManagerOrProducerShouldRegisterProducerSuccessfully() {
        User savedUser = setupCommonMocksForRegister("PRODUCTEUR", CREATOR_EMAIL);
        when(producerRepository.save(any(Producer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthenticatedUser result = userService.registerManagerOrProducer(
                NEW_EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE_NUMBER, address, CIVILITY,
                "PRODUCTEUR", "TestCompany", CREATOR_EMAIL
        );

        assertNotNull(result);
        assertEquals(NEW_EMAIL, result.getEmail());
        assertEquals("PRODUCTEUR", result.getRole());
        assertNull(result.getToken());
        verify(producerRepository, times(1)).save(argThat(producer ->
                producer.getCompanyName().equals("TestCompany") &&
                        producer.getUserId() == 1L &&
                        producer.getEmail().equals(NEW_EMAIL) // Vérification de l'email
        ));
    }

    @Test
    void registerManagerOrProducerShouldReturnNullWhenEmailExists() {
        when(userRepository.findUserByEmail(EXISTING_EMAIL)).thenReturn(existingUser);

        AuthenticatedUser result = userService.registerManagerOrProducer(
                EXISTING_EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE_NUMBER, address, CIVILITY,
                "GESTIONNAIRE", null, CREATOR_EMAIL
        );

        assertNull(result);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerManagerOrProducerShouldThrowExceptionWhenNomEntrepriseIsMissingForProducer() {
        User savedUser = new User();
        savedUser.setId(1L); // Ajout d'un ID pour simuler une sauvegarde
        savedUser.setEmail(NEW_EMAIL);
        savedUser.setFirstname(FIRSTNAME);
        savedUser.setLastname(LASTNAME);
        savedUser.setPhonenumber(PHONE_NUMBER);
        savedUser.setPassword(HASHED_PASSWORD);
        savedUser.setAddress(address);
        savedUser.setCivility(CIVILITY);
        savedUser.setRole("PRODUCTEUR");
        savedUser.setCreationDate(LocalDateTime.now());

        when(userRepository.findUserByEmail(NEW_EMAIL)).thenReturn(null);
        when(passwordEncoder.encode(PASSWORD)).thenReturn(HASHED_PASSWORD);
        when(addressRepository.save(address)).thenReturn(address);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        assertThrows(IllegalArgumentException.class, () -> {
            userService.registerManagerOrProducer(
                    NEW_EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE_NUMBER, address, CIVILITY,
                    "PRODUCTEUR", null, CREATOR_EMAIL
            );
        });

        verify(producerRepository, never()).save(any());
    }

    @Test
    void registerManagerOrProducerShouldSetCreatorToNullWhenCreatorDoesNotExist() {
        setupCommonMocksForRegister("GESTIONNAIRE", "unknown@example.com");

        AuthenticatedUser result = userService.registerManagerOrProducer(
                NEW_EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE_NUMBER, address, CIVILITY,
                "GESTIONNAIRE", null, "unknown@example.com"
        );

        assertNotNull(result);
        verify(userRepository, times(1)).save(argThat(user -> user.getCreator() == null));
    }
}