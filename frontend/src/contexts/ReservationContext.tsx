import {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useContext,
} from 'react';
import {
  Reservation,
  UserContextType,
  ReservationLotProduit,
  ReservationContextType, // Imported from types.ts
} from '../types';
import { UserContext } from './UserContext';

const ReservationContext = createContext<ReservationContextType | null>(null);

const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { authenticatedUser } = useContext(UserContext) as UserContextType;

  const fetchReservations = useCallback(
    async (clientId: number) => {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Utilisateur non authentifié ou token manquant');
      }

      const response = await fetch(`/api/reservations/client/${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticatedUser.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erreur lors de la récupération des réservations: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      setReservations(data);
    },
    [authenticatedUser],
  );

  const createReservation = useCallback(
    async (
      clientId: number,
      pickupDate: string,
      items: ReservationLotProduit[],
    ) => {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Utilisateur non authentifié ou token manquant');
      }

      const reservationData = {
        dateReservation: new Date().toISOString().split('T')[0], // Date actuelle
        dateRecuperation: pickupDate,
        etatReservation: 'Réservée',
        reservationLotsProduits: items.map((item) => ({
          lotId: { idLot: (item.lotId as { idLot: number }).idLot },
          quantite: item.quantite,
        })),
      };

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticatedUser.token}`,
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erreur lors de la création de la réservation: ${response.status} - ${errorText}`,
        );
      }

      // Mettre à jour les réservations après création
      await fetchReservations(clientId);
    },
    [authenticatedUser, fetchReservations],
  );

  const cancelReservation = useCallback(
    async (clientId: number, reservationId: number) => {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Utilisateur non authentifié ou token manquant');
      }

      const response = await fetch(
        `/api/reservations/${reservationId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authenticatedUser.token}`,
          },
          body: JSON.stringify({ etatReservation: 'Annulée' }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erreur lors de l'annulation de la réservation: ${response.status} - ${errorText}`,
        );
      }

      // Refetch reservations to update the list
      await fetchReservations(clientId);
    },
    [authenticatedUser, fetchReservations],
  );

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        fetchReservations,
        createReservation,
        cancelReservation,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export { ReservationContext, ReservationProvider };
