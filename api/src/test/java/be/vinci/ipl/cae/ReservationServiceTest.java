package be.vinci.ipl.cae;

import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import be.vinci.ipl.cae.demo.services.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ReservationService.
 * This class tests the core functionality of ReservationService using Mockito to mock dependencies.
 */
@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    private static final Long CLIENT_ID = 1L;
    private static final String CLIENT_EMAIL = "client@example.com";
    private static final Long RESERVATION_ID = 1L;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReservationService reservationService;

    private User client;
    private Reservation reservation;

    @BeforeEach
    void setUp() {
        // Initialize a user (client)
        client = new User();
        client.setId(CLIENT_ID);
        client.setEmail(CLIENT_EMAIL);
        client.setRole("CLIENT");

        // Initialize a reservation
        reservation = new Reservation();
        reservation.setIdReservation(RESERVATION_ID);
        reservation.setClient(client);
        reservation.setDateReservation(LocalDateTime.now().toLocalDate());
        reservation.setDateRecuperation(LocalDateTime.now().plusDays(1).toLocalDate());
        reservation.setEtatReservation("reservée");
    }

    @Test
    void createReservationShouldSaveAndReturnReservation() {
        // Arrange
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        // Act
        Reservation result = reservationService.createReservation(reservation);

        // Assert
        assertNotNull(result);
        assertEquals(reservation.getIdReservation(), result.getIdReservation());
        assertEquals(reservation.getClient(), result.getClient());
        assertEquals(reservation.getDateReservation(), result.getDateReservation());
        assertEquals(reservation.getDateRecuperation(), result.getDateRecuperation());
        assertEquals(reservation.getEtatReservation(), result.getEtatReservation());

        // Verify that save was called with the correct reservation
        verify(reservationRepository, times(1)).save(reservation);
    }

    @Test
    void getReservationsByClientShouldReturnEmptyListWhenClientHasNoReservations() {
        // Arrange
        when(reservationRepository.findByClient(client)).thenReturn(Collections.emptyList());

        // Act
        List<Reservation> result = reservationService.getReservationsByClient(client);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        // Verify that findByClient was called with the correct client
        verify(reservationRepository, times(1)).findByClient(client);
    }

    @Test
    void getReservationsByClientShouldReturnReservationsWhenClientHasReservations() {
        // Arrange
        List<Reservation> reservations = List.of(reservation);
        when(reservationRepository.findByClient(client)).thenReturn(reservations);

        // Act
        List<Reservation> result = reservationService.getReservationsByClient(client);

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(reservation.getIdReservation(), result.getFirst().getIdReservation());
        assertEquals(reservation.getClient(), result.getFirst().getClient());
        assertEquals(reservation.getDateReservation(), result.getFirst().getDateReservation());
        assertEquals(reservation.getDateRecuperation(), result.getFirst().getDateRecuperation());
        assertEquals(reservation.getEtatReservation(), result.getFirst().getEtatReservation());

        // Verify that findByClient was called with the correct client
        verify(reservationRepository, times(1)).findByClient(client);
    }

    @Test
    void getReservationsByClientShouldHandleNullClient() {
        // Act
        List<Reservation> result = reservationService.getReservationsByClient(null);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        // Verify that findByClient was called with null
        verify(reservationRepository, times(1)).findByClient(null);
    }

    @Test
    void findByIdShouldReturnReservationWhenReservationExists() {
        // Arrange
        when(reservationRepository.findById(RESERVATION_ID)).thenReturn(Optional.of(reservation));

        // Act
        Reservation result = reservationService.findById(RESERVATION_ID);

        // Assert
        assertNotNull(result);
        assertEquals(reservation.getIdReservation(), result.getIdReservation());
        assertEquals(reservation.getClient(), result.getClient());
        assertEquals(reservation.getDateReservation(), result.getDateReservation());
        assertEquals(reservation.getDateRecuperation(), result.getDateRecuperation());
        assertEquals(reservation.getEtatReservation(), result.getEtatReservation());

        // Verify that findById was called with the correct ID
        verify(reservationRepository, times(1)).findById(RESERVATION_ID);
    }

    @Test
    void findByIdShouldReturnNullWhenReservationDoesNotExist() {
        // Arrange
        when(reservationRepository.findById(RESERVATION_ID)).thenReturn(Optional.empty());

        // Act
        Reservation result = reservationService.findById(RESERVATION_ID);

        // Assert
        assertNull(result);

        // Verify that findById was called with the correct ID
        verify(reservationRepository, times(1)).findById(RESERVATION_ID);
    }

    @Test
    void updateReservationShouldUpdateAndReturnReservationWhenReservationExists() {
        // Arrange
        Reservation updatedReservation = new Reservation();
        updatedReservation.setIdReservation(RESERVATION_ID);
        updatedReservation.setClient(client);
        updatedReservation.setDateReservation(LocalDateTime.now().plusDays(2).toLocalDate());
        updatedReservation.setDateRecuperation(LocalDateTime.now().plusDays(3).toLocalDate());
        updatedReservation.setEtatReservation("confirmée");

        when(reservationRepository.existsById(RESERVATION_ID)).thenReturn(true);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(updatedReservation);

        // Act
        Reservation result = reservationService.updateReservation(updatedReservation);

        // Assert
        assertNotNull(result);
        assertEquals(updatedReservation.getIdReservation(), result.getIdReservation());
        assertEquals(updatedReservation.getClient(), result.getClient());
        assertEquals(updatedReservation.getDateReservation(), result.getDateReservation());
        assertEquals(updatedReservation.getDateRecuperation(), result.getDateRecuperation());
        assertEquals(updatedReservation.getEtatReservation(), result.getEtatReservation());

        // Verify that existsById and save were called
        verify(reservationRepository, times(1)).existsById(RESERVATION_ID);
        verify(reservationRepository, times(1)).save(updatedReservation);
    }

    @Test
    void updateReservationShouldReturnNullWhenReservationDoesNotExist() {
        // Arrange
        when(reservationRepository.existsById(RESERVATION_ID)).thenReturn(false);

        // Act
        Reservation result = reservationService.updateReservation(reservation);

        // Assert
        assertNull(result);

        // Verify that existsById was called and save was not called
        verify(reservationRepository, times(1)).existsById(RESERVATION_ID);
        verify(reservationRepository, never()).save(any(Reservation.class));
    }
}