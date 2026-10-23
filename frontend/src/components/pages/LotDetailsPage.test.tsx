import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import LotDetailsPage from './LotDetailsPage';
import { LotContext } from '../../contexts/LotContext';
import { UserContext } from '../../contexts/UserContext';
import { LotContextType, UserContextType, Lot } from '../../types';
import '@testing-library/jest-dom'; // Import Jest-DOM matchers

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn(),
    useLocation: vi.fn(),
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
  producer: { companyName: 'Ferme Bio', email: 'ferme@bio.com' },
  status: 'active', // Added to match Lot interface
};

const mockLotContext: LotContextType = {
  availableLots: [],
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
    email: 'test@test.com',
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

describe('LotDetailsPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked((await import('react-router-dom')).useNavigate).mockReturnValue(
      mockNavigate,
    );
    vi.mocked((await import('react-router-dom')).useParams).mockReturnValue({
      idLot: '1',
    });
    vi.mocked((await import('react-router-dom')).useLocation).mockReturnValue({
      state: { lot: null },
      key: '',
      pathname: '',
      search: '',
      hash: '',
    });
  });

  const setup = (
    lotContext: LotContextType = mockLotContext,
    userContext: UserContextType = mockUserContext,
  ) => {
    return render(
      <MemoryRouter initialEntries={['/lot/1']}>
        <UserContext.Provider value={userContext}>
          <LotContext.Provider value={lotContext}>
            <Routes>
              <Route path="/lot/:idLot" element={<LotDetailsPage />} />
            </Routes>
          </LotContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>,
    );
  };

  test('displays loader during loading', async () => {
    const slowContext: LotContextType = {
      ...mockLotContext,
      getLotById: vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) => setTimeout(() => resolve(mockLot), 100)),
        ),
    };

    setup(slowContext);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByText('Détails du lot : Tomate')).toBeInTheDocument();
      },
      { timeout: 200 },
    );
  });

  test('displays error if lot is not found', async () => {
    const errorContext: LotContextType = {
      ...mockLotContext,
      getLotById: vi.fn().mockResolvedValue(null),
    };

    setup(errorContext);

    await waitFor(() => {
      expect(screen.getByText('Lot non trouvé.')).toBeInTheDocument();
      expect(
        screen.queryByText('Détails du lot : Tomate'),
      ).not.toBeInTheDocument();
    });
  });

  test('shows "Réserver ce lot" button for client and available lot', async () => {
    const nonClientContext: UserContextType = {
      ...mockUserContext,
      authenticatedUser: {
        ...mockUserContext.authenticatedUser!,
        role: 'CLIENT',
      },
    };
    setup(mockLotContext, nonClientContext);

    await waitFor(() => {
      const reserveBtn = screen.getByRole('button', {
        name: 'Réserver ce lot',
      });
      expect(reserveBtn).toBeInTheDocument();
    });
  });

  test('hides "Réserver ce lot" button for non-client user', async () => {
    const nonClientContext: UserContextType = {
      ...mockUserContext,
      authenticatedUser: {
        ...mockUserContext.authenticatedUser!,
        role: 'GESTIONNAIRE',
      },
    };

    setup(mockLotContext, nonClientContext);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Réserver ce lot' }),
      ).not.toBeInTheDocument();
    });
  });

  test('hides "Réserver ce lot" button when remaining quantity is zero', async () => {
    const noQuantityLot: Lot = {
      ...mockLot,
      remainingQuantity: 0,
    };
    const noQuantityContext: LotContextType = {
      ...mockLotContext,
      getLotById: vi.fn().mockResolvedValue(noQuantityLot),
    };

    setup(noQuantityContext);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Réserver ce lot' }),
      ).not.toBeInTheDocument();
    });
  });

  test('navigates to reserve lot page on "Réserver ce lot" click', async () => {
    setup();

    await waitFor(() => {
      const reserveBtn = screen.getByRole('button', {
        name: 'Réserver ce lot',
      });
      fireEvent.click(reserveBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/reserve-lot', {
        state: { lot: mockLot },
      });
    });
  });

  test('navigates to my-lots page on "Mes lots" click', async () => {
    const nonClientContext: UserContextType = {
      ...mockUserContext,
      authenticatedUser: {
        ...mockUserContext.authenticatedUser!,
        role: 'PRODUCTEUR',
      },
    };
    setup(mockLotContext, nonClientContext);
    await waitFor(() => {
      const myLotsButton = screen.getByRole('button', { name: 'Mes lots' });
      fireEvent.click(myLotsButton);
      expect(mockNavigate).toHaveBeenCalledWith('/my-lots');
    });
  });

  test('uses lot from location state if provided', async () => {
    vi.mocked((await import('react-router-dom')).useLocation).mockReturnValue({
      state: { lot: mockLot },
      key: '',
      pathname: '',
      search: '',
      hash: '',
    });

    setup();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Détails du lot : Tomate')).toBeInTheDocument();
    expect(mockLotContext.getLotById).not.toHaveBeenCalled();
  });

  test('handles unauthenticated user', async () => {
    const nonClientContext: UserContextType = {
      ...mockUserContext,
      authenticatedUser: {
        ...mockUserContext.authenticatedUser!,
        role: 'PRODUCTEUR',
      },
    };
    setup(mockLotContext, nonClientContext);
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Réserver ce lot' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Mes lots' }),
      ).toBeInTheDocument();
    });
  });
});
