import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import MesLotsPage from './MesLotsPage';
import { LotContext } from '../../contexts/LotContext';
import { UserContext } from '../../contexts/UserContext';
import { LotContextType, UserContextType, Lot } from '../../types';
import '@testing-library/jest-dom';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

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

const mockLotContext: LotContextType = {
  availableLots: [mockLot],
  pendingLots: [],
  error: null,
  loading: false,
  getLotById: vi.fn().mockResolvedValue(mockLot),
  refetchLots: vi.fn(),
  fetchPendingLots: vi.fn().mockResolvedValue([]),
  receiveLot: vi.fn(),
  acceptLot: vi.fn(),
  refuseLot: vi.fn(),
};

const mockUserContext: UserContextType = {
  authenticatedUser: {
    id: 1,
    email: 'producer@test.com',
    firstname: 'Jean',
    lastname: 'Dupont',
    phonenumber: '0123456789',
    token: 'token',
    role: 'PRODUCTEUR',
  },
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  updateUser: vi.fn(),
};

describe('MesLotsPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked((await import('react-router-dom')).useNavigate).mockReturnValue(
      mockNavigate,
    );
  });

  const setup = (
    lotContext: LotContextType = mockLotContext,
    userContext: UserContextType = mockUserContext,
  ) => {
    return render(
      <MemoryRouter>
        <UserContext.Provider value={userContext}>
          <LotContext.Provider value={lotContext}>
            <MesLotsPage />
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );
  };

  test('displays loader during loading', () => {
    const loadingContext: LotContextType = {
      ...mockLotContext,
      loading: true,
    };

    setup(loadingContext);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.queryByText('Lots disponibles à la réservation'),
    ).not.toBeInTheDocument();
  });

  test('displays error if context has error', () => {
    const errorContext: LotContextType = {
      ...mockLotContext,
      error: 'Failed to fetch lots',
    };

    setup(errorContext);

    expect(screen.getByText('Failed to fetch lots')).toBeInTheDocument();
    expect(
      screen.queryByText('Lots disponibles à la réservation'),
    ).not.toBeInTheDocument();
  });

  test('displays unauthenticated message if user is not logged in', () => {
    const unauthenticatedContext: UserContextType = {
      ...mockUserContext,
      authenticatedUser: undefined,
    };

    setup(mockLotContext, unauthenticatedContext);

    expect(
      screen.getByText('Vous devez être connecté pour voir vos lots.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Lots disponibles à la réservation'),
    ).not.toBeInTheDocument();
  });

  test('displays access denied for non-producer user', () => {
    const nonProducerContext: UserContextType = {
      ...mockUserContext,
      authenticatedUser: {
        ...mockUserContext.authenticatedUser!,
        role: 'CLIENT',
      },
    };

    setup(mockLotContext, nonProducerContext);

    expect(
      screen.getByText(
        'Accès refusé : cette page est réservée aux producteurs.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Lots disponibles à la réservation'),
    ).not.toBeInTheDocument();
  });

  test('navigates to lot details on button click', () => {
    setup();

    const modifyButton = screen.getByRole('button', { name: 'Modifier' });
    fireEvent.click(modifyButton);

    expect(mockNavigate).toHaveBeenCalledWith('/lot-details/1');
  });

  test('disables button if lot ID is undefined', () => {
    const undefinedIdLot: Lot = { ...mockLot, idLot: undefined };
    const contextWithUndefinedId: LotContextType = {
      ...mockLotContext,
      availableLots: [undefinedIdLot],
    };

    setup(contextWithUndefinedId);

    const modifyButton = screen.getByRole('button', { name: 'Modifier' });
    expect(modifyButton).toBeDisabled();
  });

  test('displays empty sections when no lots match criteria', () => {
    const emptyContext: LotContextType = {
      ...mockLotContext,
      availableLots: [],
    };

    setup(emptyContext);

    expect(
      screen.getByText('Lots disponibles à la réservation'),
    ).toBeInTheDocument();
    expect(screen.getByText('Lots vendus')).toBeInTheDocument();
    expect(
      screen.getByText("Lots en attente d'être acceptés"),
    ).toBeInTheDocument();
    expect(screen.queryByText('Tomate')).not.toBeInTheDocument();
  });
});
