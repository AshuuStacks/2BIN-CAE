import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ReserveLotPage from './ReserveLotPage';
import { UserContext } from '../../contexts/UserContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Lot, Role, UserContextType } from '../../types';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        lot: {
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
          availableDate: '2025-04-22', // Updated to future date to test availableDate validation
          proposalDate: '2025-03-01',
          status: 'active',
          producer: {
            userId: 1,
            companyName: 'Ferme Dupont',
            email: 'dupont@example.com',
          },
          photo: { url: 'tomate.jpg' },
        } as Lot,
      },
    }),
  };
});

// Mock fetch compatible avec Response
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockUserContextValue: UserContextType = {
  authenticatedUser: {
    id: 1,
    email: 'client@example.com',
    token: 'fake-token',
    role: 'CLIENT' as Role,
    firstname: 'Jean',
    lastname: 'Dupont',
    phonenumber: '123456789',
  },
  registerUser: vi.fn(async () => {}),
  loginUser: vi.fn(async () => {}),
  clearUser: vi.fn(),
  updateUser: vi.fn(),
};

describe('ReserveLotPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    // Mock the current date to ensure consistent dateReservation
    vi.setSystemTime(new Date('2025-04-21'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders lot details correctly', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Réserver le lot : Tomates/i)).toBeInTheDocument();
    expect(screen.getByText(/Prix : 10 €/i)).toBeInTheDocument();
    expect(screen.getByText(/Quantité disponible : 50/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantité/i)).toHaveValue(1);
  });

  test('redirects to login if user is not authenticated', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{ ...mockUserContextValue, authenticatedUser: undefined }}
        >
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Vous devez être connecté en tant que client/i),
      ).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('redirects to login if user is not a client', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider
          value={{
            ...mockUserContextValue,
            authenticatedUser: {
              ...mockUserContextValue.authenticatedUser!,
              role: 'PRODUCTEUR' as Role,
            },
          }}
        >
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Vous devez être connecté en tant que client/i),
      ).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('updates quantity input correctly', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const quantityInput = screen.getByLabelText(/Quantité/i);
    fireEvent.change(quantityInput, { target: { value: '5' } });
    expect(quantityInput).toHaveValue(5);
  });

  test('updates recuperation date input correctly', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const dateInput = screen.getByLabelText(/Date de récupération/i);
    fireEvent.change(dateInput, { target: { value: '2025-04-22' } });
    expect(dateInput).toHaveValue('2025-04-22');
  });

  test('successful reservation submits POST request and navigates to my-reservations', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const quantityInput = screen.getByLabelText(/Quantité/i);
    const dateInput = screen.getByLabelText(/Date de récupération/i);
    const reserveButton = screen.getByText(/Confirmer la réservation/i);

    fireEvent.change(quantityInput, { target: { value: '5' } });
    fireEvent.change(dateInput, { target: { value: '2025-04-22' } });
    fireEvent.click(reserveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token',
        },
        body: JSON.stringify({
          dateReservation: '2025-04-21',
          dateRecuperation: '2025-04-22',
          etatReservation: 'Réservée', // Updated to match component
          reservationLotsProduits: [
            {
              lotId: { idLot: 1 },
              quantite: 5,
            },
          ],
        }),
      });
      expect(
        screen.getByText(/Réservation effectuée avec succès/i),
      ).toBeInTheDocument();
    });

    // Simulate navigation after timeout
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/my-reservations');
      },
      { timeout: 3000 },
    );
  });

  test('shows error when recuperation date is missing', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const reserveButton = screen.getByText(/Confirmer la réservation/i);
    fireEvent.click(reserveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Veuillez sélectionner une date de récupération/i),
      ).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  test('shows error when recuperation date is before today', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const dateInput = screen.getByLabelText(/Date de récupération/i);
    const reserveButton = screen.getByText(/Confirmer la réservation/i);

    fireEvent.change(dateInput, { target: { value: '2025-04-20' } });
    fireEvent.click(reserveButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /La date de récupération ne peut pas être antérieure à aujourd’hui/i,
        ),
      ).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  test('shows error when recuperation date is before available date', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const dateInput = screen.getByLabelText(/Date de récupération/i);
    const reserveButton = screen.getByText(/Confirmer la réservation/i);

    fireEvent.change(dateInput, { target: { value: '2025-04-21' } });
    fireEvent.click(reserveButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /La date de récupération doit être postérieure ou égale à la date de disponibilité du lot/i,
        ),
      ).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  test('shows error when API request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Invalid request',
    } as Response);

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const quantityInput = screen.getByLabelText(/Quantité/i);
    const dateInput = screen.getByLabelText(/Date de récupération/i);
    const reserveButton = screen.getByText(/Confirmer la réservation/i);

    fireEvent.change(quantityInput, { target: { value: '5' } });
    fireEvent.change(dateInput, { target: { value: '2025-04-22' } });
    fireEvent.click(reserveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token',
        },
        body: JSON.stringify({
          dateReservation: '2025-04-21',
          dateRecuperation: '2025-04-22',
          etatReservation: 'Réservée', // Updated to match component
          reservationLotsProduits: [
            {
              lotId: { idLot: 1 },
              quantite: 5,
            },
          ],
        }),
      });
      expect(
        screen.getByText(/Erreur lors de la réservation : Invalid request/i),
      ).toBeInTheDocument();
    });
  });

  test('shows error when fetch throws an exception', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const quantityInput = screen.getByLabelText(/Quantité/i);
    const dateInput = screen.getByLabelText(/Date de récupération/i);
    const reserveButton = screen.getByText(/Confirmer la réservation/i);

    fireEvent.change(quantityInput, { target: { value: '5' } });
    fireEvent.change(dateInput, { target: { value: '2025-04-22' } });
    fireEvent.click(reserveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(
        screen.getByText(/Une erreur est survenue lors de la réservation/i),
      ).toBeInTheDocument();
    });
  });

  test('navigates to home when clicking Retour button', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <ReserveLotPage />
        </UserContext.Provider>
      </MemoryRouter>,
    );

    const retourButton = screen.getByText(/Retour/i);
    fireEvent.click(retourButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
