import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
} from 'react';
import { Lot, LotContextType } from '../types';
import { UserContext } from './UserContext';

const defaultLotContext: LotContextType = {
  availableLots: [],
  pendingLots: [],
  error: null,
  loading: false,
  getLotById: async () => null,
  refetchLots: () => {},
  fetchPendingLots: async () => [],
  receiveLot: async () => null,
  acceptLot: async () => null,
  refuseLot: async () => null,
};

const LotContext = createContext<LotContextType>(defaultLotContext);

const LotContextProvider = ({ children }: { children: ReactNode }) => {
  const [availableLots, setAvailableLots] = useState<Lot[]>([]);
  const [pendingLots, setPendingLots] = useState<Lot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Changé à false par défaut
  const [refetch, setRefetch] = useState<boolean>(false);
  const { authenticatedUser } = useContext(UserContext);

  const refetchLots = useCallback(() => {
    setRefetch((prev) => !prev);
  }, []);

  const getLotById = useCallback(
    async (id: number): Promise<Lot | null> => {
      try {
        setError(null);
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (authenticatedUser?.token) {
          headers['Authorization'] = `Bearer ${authenticatedUser.token}`;
        }

        const response = await fetch(`/api/lots/${id}`, { headers });
        if (!response.ok) {
          throw new Error(`Lot non trouvé: ${response.status}`);
        }
        const lot: Lot = await response.json();
        return lot;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Une erreur inconnue est survenue.';
        setError(errorMessage);
        console.error('Erreur lors de la récupération du lot :', error);
        return null;
      }
    },
    [authenticatedUser],
  );

  const fetchPendingLots = useCallback(async (): Promise<Lot[]> => {
    try {
      setLoading(true);
      setError(null);
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (authenticatedUser?.token) {
        headers['Authorization'] = `Bearer ${authenticatedUser.token}`;
      }

      const response = await fetch('/api/lots/pending', { headers });
      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération des lots en attente ou acceptés: ${response.status}`,
        );
      }
      const lots: Lot[] = await response.json();
      setPendingLots(lots);
      return lots;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Une erreur inconnue est survenue.';
      setError(errorMessage);
      console.error(
        'Erreur lors de la récupération des lots en attente ou acceptés :',
        error,
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [authenticatedUser]);

  const receiveLot = useCallback(
    async (idLot: number): Promise<Lot | null> => {
      try {
        setError(null);
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (authenticatedUser?.token) {
          headers['Authorization'] = `Bearer ${authenticatedUser.token}`;
        }

        const response = await fetch(`/api/lots/receive/${idLot}`, {
          method: 'PUT',
          headers,
        });
        if (!response.ok) {
          throw new Error(
            `Erreur lors de la réception du lot: ${response.status}`,
          );
        }
        const updatedLot: Lot = await response.json();
        setPendingLots((prev) => prev.filter((lot) => lot.idLot !== idLot));
        return updatedLot;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Une erreur inconnue est survenue.';
        setError(errorMessage);
        console.error('Erreur lors de la réception du lot :', error);
        return null;
      }
    },
    [authenticatedUser],
  );

  const acceptLot = useCallback(
    async (idLot: number): Promise<Lot | null> => {
      try {
        setError(null);
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (authenticatedUser?.token) {
          headers['Authorization'] = `Bearer ${authenticatedUser.token}`;
        }

        const response = await fetch(`/api/lots/accept/${idLot}`, {
          method: 'PUT',
          headers,
        });
        if (!response.ok) {
          throw new Error(
            `Erreur lors de l'acceptation du lot: ${response.status}`,
          );
        }
        const updatedLot: Lot = await response.json();
        setPendingLots((prev) =>
          prev.map((lot) => (lot.idLot === idLot ? updatedLot : lot)),
        );
        return updatedLot;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Une erreur inconnue est survenue.';
        setError(errorMessage);
        console.error("Erreur lors de l'acceptation du lot :", error);
        return null;
      }
    },
    [authenticatedUser],
  );

  const refuseLot = useCallback(
    async (idLot: number, refusalReason: string): Promise<Lot | null> => {
      try {
        setError(null);
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (authenticatedUser?.token) {
          headers['Authorization'] = `Bearer ${authenticatedUser.token}`;
        }

        const response = await fetch(`/api/lots/refuse/${idLot}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ refusalReason }),
        });
        if (!response.ok) {
          throw new Error(`Erreur lors du refus du lot: ${response.status}`);
        }
        const updatedLot: Lot = await response.json();
        setPendingLots((prev) => prev.filter((lot) => lot.idLot !== idLot));
        return updatedLot;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Une erreur inconnue est survenue.';
        setError(errorMessage);
        console.error('Erreur lors du refus du lot :', error);
        return null;
      }
    },
    [authenticatedUser],
  );

  useEffect(() => {
    const fetchLots = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (authenticatedUser?.token) {
          headers['Authorization'] = `Bearer ${authenticatedUser.token}`;
          console.log('Token envoyé pour fetchLots:', authenticatedUser.token);
        } else {
          console.warn('Aucun utilisateur authentifié pour fetchLots');
        }

        const response = await fetch('/api/lots/all', { headers });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erreur lors de la récupération des lots: ${response.status} - ${errorText}`,
          );
        }
        const lots: Lot[] = await response.json();
        console.log('Lots récupérés:', lots);
        setAvailableLots(lots);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Une erreur inconnue est survenue. Veuillez contacter le support.';
        setError(errorMessage);
        console.error('Erreur lors de la récupération des lots :', error);
        setAvailableLots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [refetch, authenticatedUser]);

  return (
    <LotContext.Provider
      value={{
        availableLots,
        pendingLots,
        error,
        loading,
        getLotById,
        refetchLots,
        fetchPendingLots,
        receiveLot,
        acceptLot,
        refuseLot,
      }}
    >
      {children}
    </LotContext.Provider>
  );
};

export { LotContext, LotContextProvider };
