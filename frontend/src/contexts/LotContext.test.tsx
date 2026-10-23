import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LotContext, LotContextProvider } from './LotContext';
import { UserContext } from './UserContext';
import { Lot, LotContextType, UserContextType } from '../types';

// Mock UserContext
const mockUserContext: UserContextType = {
  authenticatedUser: {
    id: 1,
    role: 'GESTIONNAIRE',
    token: 'mock-token',
    email: 'gestionnaire@example.com',
    firstname: 'Jean',
    lastname: 'Dupont',
    phonenumber: '0123456789',
  },
  loginUser: vi.fn(),
  updateUser: vi.fn(),
  registerUser: vi.fn(),
  clearUser: vi.fn(),
};

// Mock des données de lots
const mockLots: Lot[] = [
  {
    idLot: 1,
    product: {
      libelleProduct: 'Tomate',
      productType: { libelleType: 'Légumes' },
      description: 'Tomates bio',
      unite: { unite: 'kg' },
    },
    price: 5,
    initialQuantity: 20,
    remainingQuantity: 10,
    soldQuantity: 5,
    reservedQuantity: 5,
    withdrawnQuantity: 0,
    lotStatus: 'en vente',
    status: 'en vente',
    availableDate: '2023-10-01',
    proposalDate: '2023-10-01',
    producer: {
      userId: 1,
      companyName: 'Ferme',
      email: 'ferme@example.com',
      user: {
        id: 1,
        email: 'ferme@example.com',
        firstname: 'Pierre',
        lastname: 'Martin',
        password: 'password',
        phonenumber: '0123456789',
        civility: 'M',
        address: {
          street: 'Rue de la ferme',
          postalcode: '75000',
          number: '1',
          country: 'France',
          mailbox: '',
        },
        role: 'PRODUCTEUR',
      },
    },
  },
  {
    idLot: 2,
    product: {
      libelleProduct: 'Pomme',
      productType: { libelleType: 'Fruits' },
      description: 'Pommes bio',
      unite: { unite: 'kg' },
    },
    price: 3,
    initialQuantity: 15,
    remainingQuantity: 0,
    soldQuantity: 10,
    reservedQuantity: 5,
    withdrawnQuantity: 0,
    lotStatus: 'en attente',
    status: 'en attente',
    availableDate: '2023-10-02',
    proposalDate: '2023-10-02',
    producer: {
      userId: 2,
      companyName: 'Verger',
      email: 'verger@example.com',
      user: {
        id: 2,
        email: 'verger@example.com',
        firstname: 'Marie',
        lastname: 'Durand',
        password: 'password',
        phonenumber: '0123456789',
        civility: 'Mme',
        address: {
          street: 'Rue du verger',
          postalcode: '75000',
          number: '2',
          country: 'France',
          mailbox: '',
        },
        role: 'PRODUCTEUR',
      },
    },
  },
];

describe('LotContextProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test d'initialisation
  it('initialise avec loading à false et listes vides', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/all', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(contextValues?.loading).toBe(false);
      expect(contextValues?.availableLots).toEqual([]);
      expect(contextValues?.pendingLots).toEqual([]);
      expect(contextValues?.error).toBeNull();
    });
  });

  // Test de fetchLots
  it('récupère et définit les lots disponibles avec succès', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockLots,
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/all', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(contextValues?.availableLots).toEqual(mockLots);
      expect(contextValues?.loading).toBe(false);
      expect(contextValues?.error).toBeNull();
    });
  });

  it('gère les erreurs lors de la récupération des lots', async () => {
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Échec de la récupération'));

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(contextValues?.availableLots).toEqual([]);
      expect(contextValues?.error).toBe('Échec de la récupération');
      expect(contextValues?.loading).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de la récupération des lots :',
        expect.any(Error),
      );
    });
  });

  it('gère les erreurs HTTP lors de la récupération des lots', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(contextValues?.availableLots).toEqual([]);
      expect(contextValues?.error).toBe(
        'Erreur lors de la récupération des lots: 404 - Not Found',
      );
      expect(contextValues?.loading).toBe(false);
    });
  });

  // Test de getLotById
  it('récupère un lot spécifique par ID', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockLots[0],
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    const lot = await contextValues?.getLotById(1);

    expect(mockFetch).toHaveBeenCalledWith('/api/lots/1', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
    });
    expect(lot).toEqual(mockLots[0]);
    expect(contextValues?.error).toBeNull();
  });

  it('gère les erreurs lors de la récupération d’un lot par ID', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    const lot = await contextValues?.getLotById(1);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/1', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(lot).toBeNull();
      expect(contextValues?.error).toBe('Lot non trouvé: 404');
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de la récupération du lot :',
        expect.any(Error),
      );
    });
  });

  // Test de fetchPendingLots
  it('récupère les lots en attente avec succès', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [mockLots[1]],
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    const pendingLots = await contextValues?.fetchPendingLots();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/pending', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(pendingLots).toEqual([mockLots[1]]);
      expect(contextValues?.pendingLots).toEqual([mockLots[1]]);
      expect(contextValues?.loading).toBe(false);
      expect(contextValues?.error).toBeNull();
    });
  });

  it('gère les erreurs lors de la récupération des lots en attente', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    const pendingLots = await contextValues?.fetchPendingLots();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/pending', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(pendingLots).toEqual([]);
      expect(contextValues?.pendingLots).toEqual([]);
      expect(contextValues?.error).toBe(
        'Erreur lors de la récupération des lots en attente ou acceptés: 500',
      );
      expect(contextValues?.loading).toBe(false);
    });
  });

  // Test de receiveLot

  it('gère les erreurs lors de la réception d’un lot', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({}),
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    const receivedLot = await contextValues?.receiveLot(2);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/receive/2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(receivedLot).toBeNull();
      expect(contextValues?.error).toBe(
        'Erreur lors de la réception du lot: 400',
      );
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors de la réception du lot :',
        expect.any(Error),
      );
    });
  });

  // Test de acceptLot
  it('accepte un lot avec succès', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === '/api/lots/pending') {
        return Promise.resolve({
          ok: true,
          json: async () => [mockLots[1]],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ ...mockLots[1], status: 'accepté' }),
      } as Response);
    });

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    // Pré-remplir pendingLots via fetchPendingLots
    await contextValues?.fetchPendingLots();

    // Vérifier que pendingLots est correctement initialisé
    await waitFor(() => {
      expect(contextValues?.pendingLots).toEqual([mockLots[1]]);
    });

    const acceptedLot = await contextValues?.acceptLot(2);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/accept/2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(acceptedLot).toEqual({ ...mockLots[1], status: 'accepté' });
      expect(contextValues?.pendingLots).toEqual([
        { ...mockLots[1], status: 'accepté' },
      ]);
      expect(contextValues?.error).toBeNull();
    });
  });

  it('gère les erreurs lors de l’acceptation d’un lot', async () => {
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Erreur serveur'));

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    const acceptedLot = await contextValues?.acceptLot(2);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/accept/2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(acceptedLot).toBeNull();
      expect(contextValues?.error).toBe('Erreur serveur');
      expect(console.error).toHaveBeenCalledWith(
        "Erreur lors de l'acceptation du lot :",
        expect.any(Error),
      );
    });
  });

  // Test de refuseLot
  it('refuse un lot avec succès', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === '/api/lots/pending') {
        return Promise.resolve({
          ok: true,
          json: async () => [mockLots[1]],
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ ...mockLots[1], status: 'refusé' }),
      } as Response);
    });

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    // Pré-remplir pendingLots via fetchPendingLots
    await contextValues?.fetchPendingLots();

    // Vérifier que pendingLots est correctement initialisé
    await waitFor(() => {
      expect(contextValues?.pendingLots).toEqual([mockLots[1]]);
    });

    const refusedLot = await contextValues?.refuseLot(
      2,
      'Qualité insuffisante',
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/refuse/2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify({ refusalReason: 'Qualité insuffisante' }),
      });
      expect(refusedLot).toEqual({ ...mockLots[1], status: 'refusé' });
      expect(contextValues?.pendingLots).toEqual([]); // Should now pass
      expect(contextValues?.error).toBeNull();
    });
  });

  it('gère les erreurs lors du refus d’un lot', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    const refusedLot = await contextValues?.refuseLot(
      2,
      'Qualité insuffisante',
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/refuse/2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
        body: JSON.stringify({ refusalReason: 'Qualité insuffisante' }),
      });
      expect(refusedLot).toBeNull();
      expect(contextValues?.error).toBe('Erreur lors du refus du lot: 403');
      expect(console.error).toHaveBeenCalledWith(
        'Erreur lors du refus du lot :',
        expect.any(Error),
      );
    });
  });

  // Test de refetchLots
  it('recharge les lots avec refetchLots', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockLots,
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(contextValues?.availableLots).toEqual(mockLots);
    });

    contextValues?.refetchLots();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(contextValues?.availableLots).toEqual(mockLots);
    });
  });

  // Test sans utilisateur authentifié
  it('gère les appels API sans token utilisateur', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockLots,
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider
        value={{ ...mockUserContext, authenticatedUser: undefined }}
      >
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/all', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(contextValues?.availableLots).toEqual(mockLots);
      expect(contextValues?.error).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Aucun utilisateur authentifié pour fetchLots',
      );
    });
  });

  // Test pour une réponse API vide
  it('gère une liste de lots vide', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/lots/all', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token',
        },
      });
      expect(contextValues?.availableLots).toEqual([]);
      expect(contextValues?.loading).toBe(false);
      expect(contextValues?.error).toBeNull();
    });
  });

  // Test pour une erreur inconnue
  it('gère une erreur inconnue lors de la récupération des lots', async () => {
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockRejectedValue('Erreur inconnue');

    let contextValues: LotContextType | undefined;

    render(
      <UserContext.Provider value={mockUserContext}>
        <LotContextProvider>
          <LotContext.Consumer>
            {(values) => {
              contextValues = values;
              return null;
            }}
          </LotContext.Consumer>
        </LotContextProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(contextValues?.availableLots).toEqual([]);
      expect(contextValues?.error).toBe(
        'Une erreur inconnue est survenue. Veuillez contacter le support.',
      );
      expect(contextValues?.loading).toBe(false);
    });
  });
});
