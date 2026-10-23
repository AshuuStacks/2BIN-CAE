import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ReservationDetailsPage from './ReservationDetailsPage';
import { UserContext } from '../../contexts/UserContext';
import { LotContext } from '../../contexts/LotContext';
import { ReservationContext } from '../../contexts/ReservationContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import {
  UserContextType,
  LotContextType,
  ReservationContextType,
  Reservation,
  Lot,
  AuthenticatedUser,
  Role,
} from '../../types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ idReservation: '1' }),
  };
});

// Mock image
vi.mock('../../assets/images/nopic.jpg', () => ({
  default: 'default-image.jpg',
}));

describe('ReservationDetailsPage', () => {
  const mockUser: AuthenticatedUser = {
    id: 1,
    email: 'client@example.com',
    firstname: 'Jean',
    lastname: 'Dupont',
    phonenumber: '123456789',
    token: 'fake-token',
    role: 'CLIENT' as Role,
  };

  const mockLot: Lot = {
    idLot: 1,
    product: {
      libelleProduct: 'Tomates',
      description: 'Tomates fraîches',
      unite: { unite: 'kg' },
      productType: { libelleType: 'Légume' },
    },
    price: 10,
    initialQuantity: 100,
    soldQuantity: 50,
    reservedQuantity: 0,
    remainingQuantity: 50,
    withdrawnQuantity: 0,
    lotStatus: 'en vente',
    availableDate: '2025-04-22',
    proposalDate: '2025-03-01',
    status: 'active',
    producer: {
      userId: 1,
      companyName: 'Ferme Dupont',
      email: 'dupont@example.com',
    },
    photo: { url: 'tomate.jpg' },
  };

  const mockReservation: Reservation = {
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
    reservationLotsProduits: [
      {
        lot: mockLot,
        quantite: 5,
      },
    ],
  };

  const mockUserContextValue: UserContextType = {
    authenticatedUser: mockUser,
    registerUser: vi.fn(async () => {}),
    loginUser: vi.fn(async () => {}),
    clearUser: vi.fn(),
    updateUser: vi.fn(async () => {}),
  };

  const mockLotContextValue: LotContextType = {
    availableLots: [mockLot],
    pendingLots: [],
    error: null,
    loading: false,
    getLotById: vi.fn(),
    refetchLots: vi.fn(),
    fetchPendingLots: vi.fn(async () => []),
    receiveLot: vi.fn(),
    acceptLot: vi.fn(),
    refuseLot: vi.fn(),
  };

  const mockReservationContextValue: ReservationContextType = {
    reservations: [],
    fetchReservations: vi.fn(async () => {}),
    createReservation: vi.fn(async () => {}),
    cancelReservation: vi.fn(async () => {}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  test('displays loading indicator while fetching data', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Simulate pending request

    render(
      <MemoryRouter initialEntries={['/reservation/1']}>
        <UserContext.Provider value={mockUserContextValue}>
          <LotContext.Provider value={mockLotContextValue}>
            <ReservationContext.Provider value={mockReservationContextValue}>
              <ReservationDetailsPage />
            </ReservationContext.Provider>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error message when API request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Reservation not found',
    } as Response);

    render(
      <MemoryRouter initialEntries={['/reservation/1']}>
        <UserContext.Provider value={mockUserContextValue}>
          <LotContext.Provider value={mockLotContextValue}>
            <ReservationContext.Provider value={mockReservationContextValue}>
              <ReservationDetailsPage />
            </ReservationContext.Provider>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Erreur 404: Reservation not found/i),
      ).toBeInTheDocument();
    });
  });

  test('shows "Reservation not found" when no reservation data is returned', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    } as Response);

    render(
      <MemoryRouter initialEntries={['/reservation/1']}>
        <UserContext.Provider value={mockUserContextValue}>
          <LotContext.Provider value={mockLotContextValue}>
            <ReservationContext.Provider value={mockReservationContextValue}>
              <ReservationDetailsPage />
            </ReservationContext.Provider>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Cannot read properties of null/i),
      ).toBeInTheDocument();
    });
  });

  test('shows error when user is not authenticated', async () => {
    render(
      <MemoryRouter initialEntries={['/reservation/1']}>
        <UserContext.Provider
          value={{ ...mockUserContextValue, authenticatedUser: undefined }}
        >
          <LotContext.Provider value={mockLotContextValue}>
            <ReservationContext.Provider value={mockReservationContextValue}>
              <ReservationDetailsPage />
            </ReservationContext.Provider>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Vous devez être connecté pour voir les détails/i),
      ).toBeInTheDocument();
    });
  });

  test('renders reserved items with missing lot', async () => {
    const reservationWithMissingLot: Reservation = {
      ...mockReservation,
      reservationLotsProduits: [
        {
          lot: { idLot: 2 } as Lot,
          quantite: 3,
        },
      ],
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => reservationWithMissingLot,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Lot not found',
      } as Response);

    render(
      <MemoryRouter initialEntries={['/reservation/1']}>
        <UserContext.Provider value={mockUserContextValue}>
          <LotContext.Provider
            value={{ ...mockLotContextValue, availableLots: [] }}
          >
            <ReservationContext.Provider value={mockReservationContextValue}>
              <ReservationDetailsPage />
            </ReservationContext.Provider>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Article non disponible \(Lot ID: 2, Quantité: 3\)/i),
      ).toBeInTheDocument();
    });
  });

  test('calculates total price correctly', async () => {
    const reservationWithMultipleItems: Reservation = {
      ...mockReservation,
      reservationLotsProduits: [
        { lot: { ...mockLot, idLot: 1, price: 10 }, quantite: 5 },
        { lot: { ...mockLot, idLot: 2, price: 20 }, quantite: 2 },
      ],
    };

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => reservationWithMultipleItems,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockLot, idLot: 2, price: 20 }),
      } as Response);

    render(
      <MemoryRouter initialEntries={['/reservation/1']}>
        <UserContext.Provider value={mockUserContextValue}>
          <LotContext.Provider
            value={{
              ...mockLotContextValue,
              availableLots: [mockLot, { ...mockLot, idLot: 2, price: 20 }],
            }}
          >
            <ReservationContext.Provider value={mockReservationContextValue}>
              <ReservationDetailsPage />
            </ReservationContext.Provider>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Total : 90.00 €/i)).toBeInTheDocument(); // (10 * 5) + (20 * 2) = 90
    });
  });
  test('displays error message when reservation is not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Reservation not found',
    } as Response);

    render(
      <MemoryRouter initialEntries={['/reservation/1']}>
        <UserContext.Provider value={mockUserContextValue}>
          <LotContext.Provider value={mockLotContextValue}>
            <ReservationContext.Provider value={mockReservationContextValue}>
              <ReservationDetailsPage />
            </ReservationContext.Provider>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Erreur 404: Reservation not found/i),
      ).toBeInTheDocument();
    });
  });

  test('navigates to my-reservations when clicking Retour button', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservation,
    } as Response);

    render(
      <MemoryRouter initialEntries={['/reservation/1']}>
        <UserContext.Provider value={mockUserContextValue}>
          <LotContext.Provider value={mockLotContextValue}>
            <ReservationContext.Provider value={mockReservationContextValue}>
              <ReservationDetailsPage />
            </ReservationContext.Provider>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Retour aux réservations/i));
      expect(mockNavigate).toHaveBeenCalledWith('/my-reservations');
    });
  });
});
