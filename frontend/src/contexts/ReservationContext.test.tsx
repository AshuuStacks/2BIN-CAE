import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { ReservationContext, ReservationProvider } from './ReservationContext';
import { UserContext } from './UserContext';
import type {
  Reservation,
  AuthenticatedUser,
  User,
  Lot,
  ReservationLotProduit,
  UserContextType,
} from '../types';
import { useEffect, useState, useContext } from 'react';

// Mock de UserContext pour fournir un authenticatedUser
const mockUser: User = {
  id: 1,
  email: 'alice.smith@example.com',
  firstname: 'Alice',
  lastname: 'Smith',
  password: 'password123',
  phonenumber: '+32 499 11 22 33',
  civility: 'Madame',
  address: {
    street: 'Rue de la Paix',
    postalcode: '1000',
    number: '1',
    country: 'Belgique',
    mailbox: '',
    city: 'Bruxelles',
  },
  role: 'CLIENT',
};

const mockAuthenticatedUser: AuthenticatedUser = {
  id: 1,
  email: 'alice.smith@example.com',
  firstname: 'Alice',
  lastname: 'Smith',
  phonenumber: '+32 499 11 22 33',
  role: 'CLIENT',
  token: 'mock-token-123',
  address: mockUser.address,
  creationDate: '2023-10-15',
};

const mockUserContextValue: UserContextType = {
  authenticatedUser: mockAuthenticatedUser,
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  updateUser: vi.fn(),
};

// Mock de Lot pour reservationLotsProduits
const mockLot: Lot = {
  status: 'AVAILABLE',
  idLot: 1,
  price: 10.0,
  initialQuantity: 100,
  soldQuantity: 20,
  reservedQuantity: 10,
  remainingQuantity: 70,
  withdrawnQuantity: 0,
  lotStatus: 'ACTIVE',
  availableDate: '2023-10-15',
  proposalDate: '2023-10-14',
  receptionDate: '2023-10-16',
  product: {
    id: 1,
    libelleProduct: 'Pommes',
    description: 'Pommes bio',
    unite: { id: 1, unite: 'kg' },
    productType: { id: 1, libelleType: 'Fruit' },
  },
  producer: {
    userId: 2,
    companyName: 'Ferme Bio',
    email: 'fermebio@example.com',
    user: {
      id: 2,
      email: 'fermebio@example.com',
      firstname: 'Bob',
      lastname: 'Farmer',
      password: 'password123',
      phonenumber: '+32 499 22 33 44',
      civility: 'Monsieur',
      address: {
        street: 'Rue des Champs',
        postalcode: '2000',
        number: '2',
        country: 'Belgique',
        mailbox: '',
        city: 'Liège',
      },
      role: 'PRODUCTEUR',
    },
  },
};

// Mock de Reservation pour les tests
const mockReservation: Reservation = {
  idReservation: 1,
  client: mockUser,
  dateReservation: '2023-10-15',
  dateRecuperation: '2023-10-16',
  etatReservation: 'reservée',
  reservationLotsProduits: [
    {
      lotId: { idLot: mockLot.idLot! },
      quantite: 5,
      lot: mockLot,
    },
  ],
};

// Composant de test pour consommer ReservationContext
const TestConsumer = ({
  onFetch,
  onCreate,
  onCancel,
  onReservationsUpdate,
}: {
  onFetch?: (fetchReservations: (clientId: number) => Promise<void>) => void;
  onCreate?: (
    createReservation: (
      clientId: number,
      pickupDate: string,
      items: ReservationLotProduit[],
    ) => Promise<void>,
  ) => void;
  onCancel?: (
    cancelReservation: (
      clientId: number,
      reservationId: number,
    ) => Promise<void>,
  ) => void;
  onReservationsUpdate: (reservations: Reservation[]) => void;
}) => {
  const context = useContext(ReservationContext);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (context && !hasFetched) {
      if (onFetch) onFetch(context.fetchReservations);
      if (onCreate) onCreate(context.createReservation);
      if (onCancel) onCancel(context.cancelReservation);
      setHasFetched(true);
    }
    if (context) {
      onReservationsUpdate(context.reservations);
    }
  }, [context, hasFetched, onFetch, onCreate, onCancel, onReservationsUpdate]);

  return null;
};

describe('ReservationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the current date to ensure consistent dateReservation
    vi.setSystemTime(new Date('2025-04-21'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('fetchReservations sends a GET request and updates reservations on success', async () => {
    const mockReservations: Reservation[] = [mockReservation];

    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservations,
    } as Response);

    let capturedReservations: Reservation[] = [];

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <ReservationProvider>
          <TestConsumer
            onFetch={async (fetchReservations) => {
              await act(async () => {
                await fetchReservations(1);
              });
            }}
            onReservationsUpdate={(reservations) => {
              capturedReservations = reservations;
            }}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/reservations/client/1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token-123',
        },
      });
      expect(capturedReservations).toEqual(mockReservations);
    });

    mockFetch.mockRestore();
  });

  test('fetchReservations throws an error if authenticatedUser is missing', async () => {
    const mockUserContextValueNoUser: UserContextType = {
      ...mockUserContextValue,
      authenticatedUser: undefined,
    };

    let error: Error | undefined;

    render(
      <UserContext.Provider value={mockUserContextValueNoUser}>
        <ReservationProvider>
          <TestConsumer
            onFetch={async (fetchReservations) => {
              try {
                await act(async () => {
                  await fetchReservations(1);
                });
              } catch (err) {
                error = err as Error;
              }
            }}
            onReservationsUpdate={() => {}}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(error).toBeDefined();
      expect(error?.message).toBe(
        'Utilisateur non authentifié ou token manquant',
      );
    });
  });

  test('fetchReservations throws an error if token is missing', async () => {
    const mockUserContextValueNoToken: UserContextType = {
      ...mockUserContextValue,
      authenticatedUser: { ...mockAuthenticatedUser, token: '' },
    };

    let error: Error | undefined;

    render(
      <UserContext.Provider value={mockUserContextValueNoToken}>
        <ReservationProvider>
          <TestConsumer
            onFetch={async (fetchReservations) => {
              try {
                await act(async () => {
                  await fetchReservations(1);
                });
              } catch (err) {
                error = err as Error;
              }
            }}
            onReservationsUpdate={() => {}}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(error).toBeDefined();
      expect(error?.message).toBe(
        'Utilisateur non authentifié ou token manquant',
      );
    });
  });

  test('fetchReservations throws an error if the response is not ok', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as Response);

    let error: Error | undefined;

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <ReservationProvider>
          <TestConsumer
            onFetch={async (fetchReservations) => {
              try {
                await act(async () => {
                  await fetchReservations(1);
                });
              } catch (err) {
                error = err as Error;
              }
            }}
            onReservationsUpdate={() => {}}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/reservations/client/1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token-123',
        },
      });
      expect(error).toBeDefined();
      expect(error?.message).toBe(
        'Erreur lors de la récupération des réservations: 401 - Unauthorized',
      );
    });

    mockFetch.mockRestore();
  });

  test('createReservation throws an error if authenticatedUser is missing', async () => {
    const mockUserContextValueNoUser: UserContextType = {
      ...mockUserContextValue,
      authenticatedUser: undefined,
    };

    let error: Error | undefined;

    render(
      <UserContext.Provider value={mockUserContextValueNoUser}>
        <ReservationProvider>
          <TestConsumer
            onCreate={async (createReservation) => {
              try {
                await act(async () => {
                  await createReservation(1, '2023-10-16', []);
                });
              } catch (err) {
                error = err as Error;
              }
            }}
            onReservationsUpdate={() => {}}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(error).toBeDefined();
      expect(error?.message).toBe(
        'Utilisateur non authentifié ou token manquant',
      );
    });
  });

  test('createReservation throws an error if response is not ok', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Bad Request',
    } as Response);

    let error: Error | undefined;

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <ReservationProvider>
          <TestConsumer
            onCreate={async (createReservation) => {
              try {
                await act(async () => {
                  await createReservation(1, '2023-10-16', [
                    {
                      lotId: { idLot: mockLot.idLot! },
                      quantite: 5,
                      lot: mockLot,
                    },
                  ]);
                });
              } catch (err) {
                error = err as Error;
              }
            }}
            onReservationsUpdate={() => {}}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token-123',
        },
        body: expect.any(String),
      });
      expect(error).toBeDefined();
      expect(error?.message).toBe(
        'Erreur lors de la création de la réservation: 400 - Bad Request',
      );
    });

    mockFetch.mockRestore();
  });

  test('cancelReservation sends a PATCH request and refetches reservations on success', async () => {
    const mockFetch = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response) // PATCH response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ ...mockReservation, etatReservation: 'Annulée' }],
      } as Response); // GET response after refetch

    let capturedReservations: Reservation[] = [];

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <ReservationProvider>
          <TestConsumer
            onCancel={async (cancelReservation) => {
              await act(async () => {
                await cancelReservation(1, mockReservation.idReservation);
              });
            }}
            onReservationsUpdate={(reservations) => {
              capturedReservations = reservations;
            }}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/reservations/${mockReservation.idReservation}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token-123',
          },
          body: JSON.stringify({ etatReservation: 'Annulée' }),
        },
      );
      expect(mockFetch).toHaveBeenCalledWith('/api/reservations/client/1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token-123',
        },
      });
      expect(capturedReservations).toEqual([
        { ...mockReservation, etatReservation: 'Annulée' },
      ]);
    });

    mockFetch.mockRestore();
  });

  test('cancelReservation throws an error if authenticatedUser is missing', async () => {
    const mockUserContextValueNoUser: UserContextType = {
      ...mockUserContextValue,
      authenticatedUser: undefined,
    };

    let error: Error | undefined;

    render(
      <UserContext.Provider value={mockUserContextValueNoUser}>
        <ReservationProvider>
          <TestConsumer
            onCancel={async (cancelReservation) => {
              try {
                await act(async () => {
                  await cancelReservation(1, mockReservation.idReservation);
                });
              } catch (err) {
                error = err as Error;
              }
            }}
            onReservationsUpdate={() => {}}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(error).toBeDefined();
      expect(error?.message).toBe(
        'Utilisateur non authentifié ou token manquant',
      );
    });
  });

  test('cancelReservation throws an error if response is not ok', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    } as Response);

    let error: Error | undefined;

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <ReservationProvider>
          <TestConsumer
            onCancel={async (cancelReservation) => {
              try {
                await act(async () => {
                  await cancelReservation(1, mockReservation.idReservation);
                });
              } catch (err) {
                error = err as Error;
              }
            }}
            onReservationsUpdate={() => {}}
          />
        </ReservationProvider>
      </UserContext.Provider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/reservations/${mockReservation.idReservation}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token-123',
          },
          body: JSON.stringify({ etatReservation: 'Annulée' }),
        },
      );
      expect(error).toBeDefined();
      expect(error?.message).toBe(
        "Erreur lors de l'annulation de la réservation: 404 - Not Found",
      );
    });

    mockFetch.mockRestore();
  });
});
