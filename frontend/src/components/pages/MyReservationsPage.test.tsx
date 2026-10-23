import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import MyReservationsPage from './MyReservationsPage';
import { UserContext } from '../../contexts/UserContext';
import { ReservationContext } from '../../contexts/ReservationContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import {
  UserContextType,
  ReservationContextType,
  Reservation,
  AuthenticatedUser,
  Role,
} from '../../types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('MyReservationsPage', () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    email: 'client@example.com',
    firstname: 'Jean',
    lastname: 'Dupont',
    phonenumber: '123456789',
    token: 'fake-token',
    role: 'CLIENT' as Role,
  };

  const mockReservations: Reservation[] = [
    {
      idReservation: 1,
      client: {
        id: 1,
        email: 'client@example.com',
        firstname: 'Jean',
        lastname: 'Dupont',
        phonenumber: '123456789',
        password: 'password',
        civility: 'M',
        address: {
          street: '123 Rue Test',
          postalcode: '75001',
          number: '1',
          country: 'France',
          mailbox: '1',
        },
        role: 'CLIENT' as Role,
      },
      dateReservation: '2025-04-21',
      dateRecuperation: '2025-04-22',
      etatReservation: 'EN_ATTENTE',
      reservationLotsProduits: [],
    },
    {
      idReservation: 2,
      client: {
        id: 1,
        email: 'client@example.com',
        firstname: 'Jean',
        lastname: 'Dupont',
        phonenumber: '123456789',
        password: 'password',
        civility: 'M',
        address: {
          street: '123 Rue Test',
          postalcode: '75001',
          number: '1',
          country: 'France',
          mailbox: '1',
        },
        role: 'CLIENT' as Role,
      },
      dateReservation: '2025-04-20',
      dateRecuperation: '2025-04-21',
      etatReservation: 'annulée', // Changed to lowercase to match component filtering
      reservationLotsProduits: [],
    },
    {
      idReservation: 3,
      client: {
        id: 1,
        email: 'client@example.com',
        firstname: 'Jean',
        lastname: 'Dupont',
        phonenumber: '123456789',
        password: 'password',
        civility: 'M',
        address: {
          street: '123 Rue Test',
          postalcode: '75001',
          number: '1',
          country: 'France',
          mailbox: '1',
        },
        role: 'CLIENT' as Role,
      },
      dateReservation: '2025-04-19',
      dateRecuperation: '2025-04-20',
      etatReservation: 'récupérée',
      reservationLotsProduits: [],
    },
  ];

  const mockUserContextValue: UserContextType = {
    authenticatedUser: mockUser,
    registerUser: vi.fn(async () => {}),
    loginUser: vi.fn(async () => {}),
    clearUser: vi.fn(),
    updateUser: vi.fn(async () => {}),
  };

  const mockReservationContextValue: ReservationContextType = {
    reservations: mockReservations,
    fetchReservations: vi.fn(async () => {}),
    createReservation: vi.fn(async () => {}),
    cancelReservation: vi.fn(async () => {}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
  });

  test('displays error when ReservationContext is missing', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <MyReservationsPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Le contexte des réservations n'est pas disponible/i),
    ).toBeInTheDocument();
  });

  test('displays error when user is not authenticated', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{ ...mockUserContextValue, authenticatedUser: undefined }}
        >
          <ReservationContext.Provider value={mockReservationContextValue}>
            <MyReservationsPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Veuillez vous connecter pour voir vos réservations/i),
      ).toBeInTheDocument();
      expect(
        mockReservationContextValue.fetchReservations,
      ).not.toHaveBeenCalled();
    });
  });

  test('displays loading indicator while fetching reservations', () => {
    const mockFetchReservations = vi
      .fn()
      .mockImplementation(() => new Promise(() => {})); // Simulate pending promise
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReservationContext.Provider
            value={{
              ...mockReservationContextValue,
              fetchReservations: mockFetchReservations,
            }}
          >
            <MyReservationsPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays reservations correctly after successful fetch', async () => {
    const mockFetchReservations = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReservationContext.Provider
            value={{
              ...mockReservationContextValue,
              fetchReservations: mockFetchReservations,
            }}
          >
            <MyReservationsPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        expect(mockFetchReservations).toHaveBeenCalledWith(1);
        expect(
          screen.getByText(/Réservations chargées avec succès !/i),
        ).toBeInTheDocument();
        expect(screen.getByText('Mes Réservations')).toBeInTheDocument(); // Exact match for current reservations header
        expect(
          screen.getByText('Mes Réservations Passées'),
        ).toBeInTheDocument(); // Exact match for past reservations header
        expect(screen.getByText(/Réservation #1/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Date de réservation : 2025-04-21/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Date de récupération : 2025-04-22/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/État : En attente/i)).toBeInTheDocument();
        expect(screen.getByText(/Réservation #2/i)).toBeInTheDocument();
        expect(screen.getByText(/État : Annulée/i)).toBeInTheDocument();
        expect(screen.getByText(/Réservation #3/i)).toBeInTheDocument();
        expect(screen.getByText(/État : Récupérée/i)).toBeInTheDocument();
      },
      { timeout: 10000 }, // Increased timeout to handle rendering delays
    );
  });

  test('displays error when fetchReservations fails', async () => {
    const mockFetchReservations = vi
      .fn()
      .mockRejectedValue(new Error('Fetch failed'));
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReservationContext.Provider
            value={{
              ...mockReservationContextValue,
              fetchReservations: mockFetchReservations,
            }}
          >
            <MyReservationsPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        expect(mockFetchReservations).toHaveBeenCalledWith(1);
        expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });
  test('navigates to reservation details on button click', async () => {
    const mockFetchReservations = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReservationContext.Provider
            value={{
              ...mockReservationContextValue,
              fetchReservations: mockFetchReservations,
            }}
          >
            <MyReservationsPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        const buttons = screen.getAllByText(/Voir les détails/i);
        fireEvent.click(buttons[0]); // Click on first reservation's button
        expect(mockNavigate).toHaveBeenCalledWith('/reservation-details/1');
      },
      { timeout: 10000 },
    );
  });
});
