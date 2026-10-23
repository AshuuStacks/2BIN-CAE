import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import ManagePendingLotsPage from './ManagePendingLotsPage';
import { LotContext } from '../../contexts/LotContext';
import { UserContext } from '../../contexts/UserContext';
import { Lot, LotContextType, UserContextType } from '../../types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockLots: Lot[] = [
  {
    idLot: 1,
    product: {
      id: 1,
      libelleProduct: 'Pommes',
      description: '',
      unite: { id: 1, unite: 'kg' },
      productType: { id: 1, libelleType: 'Fruit' },
    },
    producer: {
      userId: 1,
      companyName: 'Ferme Dupont',
      email: 'dupont@example.com',
    },
    price: 10,
    initialQuantity: 100,
    soldQuantity: 0,
    reservedQuantity: 0,
    remainingQuantity: 100,
    withdrawnQuantity: 0,
    lotStatus: 'en attente',
    availableDate: '2023-10-01',
    proposalDate: '2023-10-01',
    receptionDate: undefined,
    status: 'pending',
  },
  {
    idLot: 2,
    product: {
      id: 2,
      libelleProduct: 'Poires',
      description: '',
      unite: { id: 1, unite: 'kg' },
      productType: { id: 1, libelleType: 'Fruit' },
    },
    producer: {
      userId: 2,
      companyName: 'Ferme Martin',
      email: 'martin@example.com',
    },
    price: 15,
    initialQuantity: 50,
    soldQuantity: 0,
    reservedQuantity: 0,
    remainingQuantity: 50,
    withdrawnQuantity: 0,
    lotStatus: 'accepté',
    availableDate: '2023-10-02',
    proposalDate: '2023-10-02',
    receptionDate: '2023-10-03',
    status: 'accepted',
  },
];

const createMockContexts = (
  overrides: {
    lotContext?: Partial<LotContextType>;
    userContext?: Partial<UserContextType>;
  } = {},
) => {
  const fetchPendingLotsMock = vi.fn().mockResolvedValue(mockLots);
  const acceptLotMock = vi.fn().mockResolvedValue(mockLots[0]);
  const refuseLotMock = vi.fn().mockResolvedValue(mockLots[0]);
  const receiveLotMock = vi.fn().mockResolvedValue(mockLots[1]);

  const lotContextValue: LotContextType = {
    availableLots: [],
    pendingLots: mockLots,
    fetchPendingLots: fetchPendingLotsMock,
    acceptLot: acceptLotMock,
    refuseLot: refuseLotMock,
    receiveLot: receiveLotMock,
    getLotById: vi.fn().mockResolvedValue(null),
    refetchLots: vi.fn(),
    error: null,
    loading: false,
    ...overrides.lotContext,
  };

  const userContextValue: UserContextType = {
    authenticatedUser: {
      id: 1,
      email: 'admin@example.com',
      firstname: 'Admin',
      lastname: 'User',
      phonenumber: '123456789',
      token: 'mock-token',
      role: 'GESTIONNAIRE',
    },
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    ...overrides.userContext,
  };

  return {
    lotContextValue,
    userContextValue,
    fetchPendingLotsMock,
    acceptLotMock,
    refuseLotMock,
    receiveLotMock,
  };
};

const renderManagePendingLotsPage = (
  lotContextValue: LotContextType,
  userContextValue: UserContextType,
) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={userContextValue}>
        <LotContext.Provider value={lotContextValue}>
          <ManagePendingLotsPage />
        </LotContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('ManagePendingLotsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the page with title and table', () => {
    const { lotContextValue, userContextValue } = createMockContexts();
    renderManagePendingLotsPage(lotContextValue, userContextValue);

    expect(
      screen.getByText(/Gestion des lots en attente/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('ID Lot')).toBeInTheDocument();
    expect(screen.getByText('Produit')).toBeInTheDocument();
    expect(screen.getByText('Producteur')).toBeInTheDocument();
    expect(screen.getByText('Pommes')).toBeInTheDocument();
    expect(screen.getByText('Poires')).toBeInTheDocument();
  });

  test('redirects to home if user is not authenticated', () => {
    const { lotContextValue } = createMockContexts();
    const userContextValue: UserContextType = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
    };

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    expect(screen.queryByText(/Gestion des lots en attente/i)).toBeNull();
  });

  test('redirects to home if user is not GESTIONNAIRE', () => {
    const { lotContextValue } = createMockContexts();
    const userContextValue: UserContextType = {
      authenticatedUser: {
        id: 1,
        email: 'client@example.com',
        firstname: 'Client',
        lastname: 'User',
        phonenumber: '123456789',
        token: 'mock-token',
        role: 'CLIENT',
      },
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
    };

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    expect(screen.queryByText(/Gestion des lots en attente/i)).toBeNull();
  });

  test('displays loading indicator when loading is true', () => {
    const { lotContextValue, userContextValue } = createMockContexts({
      lotContext: { loading: true },
    });

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays no lots message when pendingLots is empty', () => {
    const { lotContextValue, userContextValue } = createMockContexts({
      lotContext: { pendingLots: [] },
    });

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    expect(
      screen.getByText(/Aucun lot en attente ou accepté/i),
    ).toBeInTheDocument();
  });

  test('displays error message when error is present', () => {
    const errorMessage = 'Erreur lors de la récupération des lots';
    const { lotContextValue, userContextValue } = createMockContexts({
      lotContext: { error: errorMessage },
    });

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('calls acceptLot and shows success message when accept button is clicked', async () => {
    const {
      lotContextValue,
      userContextValue,
      acceptLotMock,
      fetchPendingLotsMock,
    } = createMockContexts();
    const updatedLot = {
      ...mockLots[0],
      lotStatus: 'accepté',
      status: 'accepted',
    };
    acceptLotMock.mockResolvedValue(updatedLot);

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      fireEvent.click(acceptButton);
    });

    await waitFor(() => {
      expect(acceptLotMock).toHaveBeenCalledWith(1);
      expect(fetchPendingLotsMock).toHaveBeenCalledTimes(2); // 1 for useEffect, 1 for handleAccept
      expect(
        screen.getByText(/Le lot 1 a été accepté avec succès !/i),
      ).toBeInTheDocument();
    });
  });

  test('handles acceptLot failure and does not show success message', async () => {
    const {
      lotContextValue,
      userContextValue,
      acceptLotMock,
      fetchPendingLotsMock,
    } = createMockContexts();
    acceptLotMock.mockResolvedValue(null);

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const acceptButton = screen.getByRole('button', { name: /Accepter/i });
      fireEvent.click(acceptButton);
    });

    await waitFor(() => {
      expect(acceptLotMock).toHaveBeenCalledWith(1);
      expect(fetchPendingLotsMock).toHaveBeenCalledTimes(1); // Only called by useEffect
      expect(
        screen.queryByText(/Le lot 1 a été accepté avec succès !/i),
      ).toBeNull();
    });
  });

  test('shows refusal input and buttons when refuse button is clicked', async () => {
    const { lotContextValue, userContextValue } = createMockContexts();

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const refuseButton = screen.getByRole('button', { name: /Refuser/i });
      fireEvent.click(refuseButton);
    });

    await waitFor(() => {
      const reasonInput = screen.getByRole('textbox', {
        name: /Raison du refus/i,
      });
      expect(reasonInput).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Confirmer/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Annuler/i }),
      ).toBeInTheDocument();
    });
  });

  test('calls refuseLot and shows success message when refusal is confirmed', async () => {
    const {
      lotContextValue,
      userContextValue,
      refuseLotMock,
      fetchPendingLotsMock,
    } = createMockContexts();
    const updatedLot = {
      ...mockLots[0],
      lotStatus: 'refusé',
      status: 'refused',
    };
    refuseLotMock.mockResolvedValue(updatedLot);

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const refuseButton = screen.getByRole('button', { name: /Refuser/i });
      fireEvent.click(refuseButton);
    });

    await waitFor(() => {
      const reasonInput = screen.getByRole('textbox', {
        name: /Raison du refus/i,
      });
      fireEvent.change(reasonInput, {
        target: { value: 'Qualité insuffisante' },
      });

      const confirmButton = screen.getByRole('button', { name: /Confirmer/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(refuseLotMock).toHaveBeenCalledWith(1, 'Qualité insuffisante');
      expect(fetchPendingLotsMock).toHaveBeenCalledTimes(2); // 1 for useEffect, 1 for handleRefuseConfirm
      expect(
        screen.getByText(/Le lot 1 a été refusé avec succès !/i),
      ).toBeInTheDocument();
    });
  });

  test('handles refuseLot failure and does not show success message', async () => {
    const {
      lotContextValue,
      userContextValue,
      refuseLotMock,
      fetchPendingLotsMock,
    } = createMockContexts();
    refuseLotMock.mockResolvedValue(null);

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const refuseButton = screen.getByRole('button', { name: /Refuser/i });
      fireEvent.click(refuseButton);
    });

    await waitFor(() => {
      const reasonInput = screen.getByRole('textbox', {
        name: /Raison du refus/i,
      });
      fireEvent.change(reasonInput, {
        target: { value: 'Qualité insuffisante' },
      });

      const confirmButton = screen.getByRole('button', { name: /Confirmer/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(refuseLotMock).toHaveBeenCalledWith(1, 'Qualité insuffisante');
      expect(fetchPendingLotsMock).toHaveBeenCalledTimes(1); // Only called by useEffect
      expect(
        screen.queryByText(/Le lot 1 a été refusé avec succès !/i),
      ).toBeNull();
    });
  });

  test('displays alert when refusing without a reason', async () => {
    const { lotContextValue, userContextValue } = createMockContexts();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const refuseButton = screen.getByRole('button', { name: /Refuser/i });
      fireEvent.click(refuseButton);
    });

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /Confirmer/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        'Veuillez fournir une raison de refus.',
      );
    });

    alertMock.mockRestore();
  });

  test('cancels refusal and clears input', async () => {
    const { lotContextValue, userContextValue } = createMockContexts();

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const refuseButton = screen.getByRole('button', { name: /Refuser/i });
      fireEvent.click(refuseButton);
    });

    await waitFor(() => {
      const reasonInput = screen.getByRole('textbox', {
        name: /Raison du refus/i,
      });
      fireEvent.change(reasonInput, {
        target: { value: 'Qualité insuffisante' },
      });

      const cancelButton = screen.getByRole('button', { name: /Annuler/i });
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('textbox', { name: /Raison du refus/i }),
      ).toBeNull();
      expect(
        screen.getByRole('button', { name: /Refuser/i }),
      ).toBeInTheDocument();
    });
  });

  test('calls receiveLot and shows success message when receive button is clicked', async () => {
    const {
      lotContextValue,
      userContextValue,
      receiveLotMock,
      fetchPendingLotsMock,
    } = createMockContexts();
    const updatedLot = {
      ...mockLots[1],
      lotStatus: 'reçu',
      status: 'received',
      receptionDate: '2023-10-04',
    };
    receiveLotMock.mockResolvedValue(updatedLot);

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const receiveButton = screen.getByRole('button', {
        name: /Réceptionner/i,
      });
      fireEvent.click(receiveButton);
    });

    await waitFor(() => {
      expect(receiveLotMock).toHaveBeenCalledWith(2);
      expect(fetchPendingLotsMock).toHaveBeenCalledTimes(2); // 1 for useEffect, 1 for handleReceive
      expect(
        screen.getByText(
          /Le lot 2 a été réceptionné et mis en vente avec succès !/i,
        ),
      ).toBeInTheDocument();
    });
  });

  test('handles receiveLot failure and does not show success message', async () => {
    const {
      lotContextValue,
      userContextValue,
      receiveLotMock,
      fetchPendingLotsMock,
    } = createMockContexts();
    receiveLotMock.mockResolvedValue(null);

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await act(async () => {
      const receiveButton = screen.getByRole('button', {
        name: /Réceptionner/i,
      });
      fireEvent.click(receiveButton);
    });

    await waitFor(() => {
      expect(receiveLotMock).toHaveBeenCalledWith(2);
      expect(fetchPendingLotsMock).toHaveBeenCalledTimes(1); // Only called by useEffect
      expect(
        screen.queryByText(
          /Le lot 2 a été réceptionné et mis en vente avec succès !/i,
        ),
      ).toBeNull();
    });
  });

  test('fetches pending lots on mount', async () => {
    const { lotContextValue, userContextValue, fetchPendingLotsMock } =
      createMockContexts();

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await waitFor(() => {
      expect(fetchPendingLotsMock).toHaveBeenCalledTimes(1);
    });
  });

  test('handles fetchPendingLots failure and displays error', async () => {
    const errorMessage = 'Erreur lors de la récupération des lots';
    const { lotContextValue, userContextValue, fetchPendingLotsMock } =
      createMockContexts({
        lotContext: { error: errorMessage, pendingLots: [] },
      });
    fetchPendingLotsMock.mockResolvedValue([]);

    renderManagePendingLotsPage(lotContextValue, userContextValue);

    await waitFor(() => {
      expect(fetchPendingLotsMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(
        screen.getByText(/Aucun lot en attente ou accepté/i),
      ).toBeInTheDocument();
    });
  });
});
