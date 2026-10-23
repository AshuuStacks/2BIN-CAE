import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Added for Select interaction
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import MyCartPage from './MyCartPage';
import { ReservationContext } from '../../contexts/ReservationContext';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType, ReservationContextType, Lot } from '../../types';
import '@testing-library/jest-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockLot: Lot = {
  idLot: 1,
  product: {
    libelleProduct: 'Tomate',
    productType: { libelleType: 'Légumes' },
    unite: { unite: 'Kg' },
    description: 'Des tomates bien rouges',
  },
  price: 5,
  initialQuantity: 10,
  remainingQuantity: 5,
  soldQuantity: 2,
  reservedQuantity: 3,
  withdrawnQuantity: 0,
  lotStatus: 'en vente',
  availableDate: '2025-04-20',
  proposalDate: '2025-04-18',
  receptionDate: '2025-04-22',
  photo: { url: '/tomate.jpg' },
  producer: { companyName: 'Ferme Bio', email: 'ferme@bio.com', userId: 1 },
  status: 'active',
};

const mockUserContext: UserContextType = {
  authenticatedUser: {
    id: 1,
    email: 'client@test.com',
    firstname: 'Alice',
    lastname: 'Dupont',
    phonenumber: '0123456789',
    token: 'token',
    role: 'CLIENT',
  },
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  updateUser: vi.fn(),
};

const mockReservationContext: ReservationContextType = {
  reservations: [],
  fetchReservations: vi.fn(),
  createReservation: vi.fn().mockResolvedValue(undefined),
  cancelReservation: vi.fn(),
};

describe('MyCartPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked((await import('react-router-dom')).useNavigate).mockReturnValue(
      mockNavigate,
    );
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([{ lot: mockLot, quantity: 2 }]),
    );
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  const setup = (
    userContext: UserContextType = mockUserContext,
    reservationContext: ReservationContextType = mockReservationContext,
    initialCart: { lot: Lot; quantity: number }[] = [
      { lot: mockLot, quantity: 2 },
    ],
  ) => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialCart));
    return render(
      <MemoryRouter>
        <UserContext.Provider value={userContext}>
          <ReservationContext.Provider value={reservationContext}>
            <MyCartPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );
  };

  test('displays empty cart message when cart is empty', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    setup(mockUserContext, mockReservationContext, []);

    expect(screen.getByText('Votre panier est vide.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Découvrir les produits' }),
    ).toBeInTheDocument();
  });

  test('removes item from cart and shows snackbar', () => {
    setup();

    const deleteButton = screen.getByLabelText("Supprimer l'article");
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Tomate')).not.toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([]),
    );
    expect(screen.getByText('Tomate supprimé du panier !')).toBeInTheDocument();
  });

  test('disables checkout button when pickup date is not selected', () => {
    setup();

    const checkoutButton = screen.getByRole('button', {
      name: 'Réserver la commande',
    });
    expect(checkoutButton).toBeDisabled();
  });

  test('handles successful checkout', async () => {
    const user = userEvent.setup();
    setup();

    // Open the Select and choose a date
    const dateSelect = screen.getByLabelText('Date de récupération');
    await user.click(dateSelect);
    const dateOption = screen.getByText('24/04/2025'); // Matches formatDisplayDate
    await user.click(dateOption);

    const checkoutButton = screen.getByRole('button', {
      name: 'Réserver la commande',
    });
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(mockReservationContext.createReservation).toHaveBeenCalledWith(
        1,
        '2025-04-24',
        [{ lot: mockLot, lotId: { idLot: 1 }, quantite: 2 }],
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('cart');
      expect(
        screen.getByText('Réservation effectuée avec succès !'),
      ).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/my-reservations');
    });
  });

  test('displays error for unauthenticated user on checkout', async () => {
    const user = userEvent.setup();
    const unauthenticatedContext: UserContextType = {
      ...mockUserContext,
      authenticatedUser: undefined,
    };
    setup(unauthenticatedContext);

    const dateSelect = screen.getByLabelText('Date de récupération');
    await user.click(dateSelect);
    const dateOption = screen.getByText('24/04/2025');
    await user.click(dateOption);

    const checkoutButton = screen.getByRole('button', {
      name: 'Réserver la commande',
    });
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(
        screen.getByText('Utilisateur non authentifié.'),
      ).toBeInTheDocument();
      expect(mockReservationContext.createReservation).not.toHaveBeenCalled();
    });
  });

  test('displays error for non-client user on checkout', async () => {
    const user = userEvent.setup();
    const nonClientContext: UserContextType = {
      ...mockUserContext,
      authenticatedUser: {
        ...mockUserContext.authenticatedUser!,
        role: 'PRODUCTEUR',
      },
    };
    setup(nonClientContext);

    const dateSelect = screen.getByLabelText('Date de récupération');
    await user.click(dateSelect);
    const dateOption = screen.getByText('24/04/2025');
    await user.click(dateOption);

    const checkoutButton = screen.getByRole('button', {
      name: 'Réserver la commande',
    });
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Seuls les clients peuvent effectuer des réservations.',
        ),
      ).toBeInTheDocument();
      expect(mockReservationContext.createReservation).not.toHaveBeenCalled();
    });
  });
});
