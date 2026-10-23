import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { LotContext } from '../../contexts/LotContext';
import { ReservationContext } from '../../contexts/ReservationContext';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  styled,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import logo from '../../assets/images/nopic.jpg';
import {
  Reservation,
  UserContextType,
  Lot,
  LotContextType,
  ReservationContextType,
} from '../../types';

// Map backend status to French labels
const statusLabels: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CANCELLED: 'Annulée',
  récupérée: 'Récupérée', // Ajout pour l'état "récupérée"
  // Add other statuses as needed, e.g., CONFIRMED: 'Confirmée'
};

const GreenContainer = styled(Box)(() => ({
  padding: 4,
  backgroundColor: '#f5f7f5',
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)',
  minHeight: '400px',
  maxWidth: '1000px',
  margin: '0 auto',
  marginTop: '2rem',
}));

const StyledAlert = styled(Alert)(() => ({
  backgroundColor: '#e8f5e9',
  color: '#2e7d32',
  border: '1px solid #4caf50',
  borderRadius: 8,
  marginBottom: 2,
}));

const GreenButton = styled(Button)(() => ({
  backgroundColor: '#2e7d32',
  color: '#ffffff',
  borderRadius: 8,
  padding: '12px 24px',
  fontWeight: 'bold',
  textTransform: 'none',
  marginTop: 2,
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
}));

const StyledCancelButton = styled(Button)(() => ({
  backgroundColor: '#757575',
  color: '#ffffff',
  borderRadius: 8,
  padding: '12px 24px',
  fontWeight: 'bold',
  textTransform: 'none',
  marginTop: 2,
  marginLeft: 2,
  '&:hover': {
    backgroundColor: '#616161',
  },
}));

const StyledCard = styled(Card)(() => ({
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)',
  },
  backgroundColor: '#f9faf9',
  border: '2px solid #4caf50',
}));

const ReservationDetailsPage = () => {
  const { idReservation } = useParams<{ idReservation: string }>();
  const { authenticatedUser } = useContext(UserContext) as UserContextType;
  const { availableLots } = useContext(LotContext) as LotContextType;
  const { cancelReservation } = useContext(
    ReservationContext,
  ) as ReservationContextType;
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [lots, setLots] = useState<Map<number, Lot>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchLot = useCallback(
    async (idLot: number): Promise<Lot | null> => {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Utilisateur non authentifié ou token manquant');
      }

      try {
        const response = await fetch(`/api/lots/${idLot}`, {
          headers: {
            Authorization: `Bearer ${authenticatedUser.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        return await response.json();
      } catch (err) {
        console.error(`Failed to fetch lot ${idLot}:`, err);
        return null;
      }
    },
    [authenticatedUser],
  );

  useEffect(() => {
    const fetchReservation = async () => {
      if (!authenticatedUser || !authenticatedUser.token) {
        setError('Vous devez être connecté pour voir les détails.');
        setLoading(false);
        return;
      }

      if (!idReservation) {
        setError('ID de réservation manquant.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/reservations/${idReservation}`, {
          headers: {
            Authorization: `Bearer ${authenticatedUser.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }

        const data: Reservation = await response.json();
        setReservation(data);

        // Create a Map of available lots from LotContext
        const availableLotsMap = new Map<number, Lot>(
          availableLots
            .filter(
              (lot): lot is Lot & { idLot: number } =>
                typeof lot.idLot === 'number',
            )
            .map((lot) => [lot.idLot, lot]),
        );

        // Create a new Map for lots without referencing the current lots state
        const newLots = new Map<number, Lot>();
        const lotPromises = data.reservationLotsProduits.map(async (item) => {
          if (!item.lot || !item.lot.idLot) {
            return;
          }

          const lotId = item.lot.idLot;

          // Skip if lot is already in newLots or availableLots
          if (newLots.has(lotId) || availableLotsMap.has(lotId)) {
            if (availableLotsMap.has(lotId)) {
              newLots.set(lotId, availableLotsMap.get(lotId)!);
            }
            return;
          }

          // Fetch lot from API
          const lot = await fetchLot(lotId);
          if (lot) {
            newLots.set(lotId, lot);
          }
        });

        await Promise.all(lotPromises.filter((p) => p !== undefined));
        setLots(newLots);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Une erreur est survenue.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [idReservation, authenticatedUser, availableLots, fetchLot]);

  const handleCancelReservation = () => {
    setOpenDialog(true);
  };

  const confirmCancel = async () => {
    if (!authenticatedUser || !authenticatedUser.id || !idReservation) {
      setError('Utilisateur non authentifié ou ID de réservation manquant.');
      setOpenDialog(false);
      return;
    }

    try {
      await cancelReservation(authenticatedUser.id, parseInt(idReservation));
      setError(null);
      setReservation((prev) =>
        prev ? { ...prev, etatReservation: 'CANCELLED' } : null,
      );
      setOpenDialog(false);
      navigate('/my-reservations', {
        state: {
          message: `Réservation #${idReservation} annulée avec succès !`,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'annulation.",
      );
      setOpenDialog(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}
      >
        <CircularProgress style={{ color: '#2e7d32' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <GreenContainer>
        <StyledAlert severity="error">{error}</StyledAlert>
      </GreenContainer>
    );
  }

  if (!reservation) {
    return (
      <GreenContainer>
        <StyledAlert severity="info">Réservation non trouvée.</StyledAlert>
      </GreenContainer>
    );
  }

  return (
    <GreenContainer>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          color: '#2e7d32',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(46, 125, 50, 0.2)',
          marginBottom: 3,
        }}
      >
        Détails de la réservation #{reservation.idReservation}
      </Typography>

      <Box
        sx={{
          marginBottom: 3,
          backgroundColor: '#ffffff',
          padding: 2,
          borderRadius: 8,
          border: '1px solid #4caf50',
        }}
      >
        <Typography sx={{ color: '#333333', marginBottom: 1 }}>
          <strong>Client :</strong> {reservation.client.email}
        </Typography>
        <Typography sx={{ color: '#333333', marginBottom: 1 }}>
          <strong>Date de réservation :</strong> {reservation.dateReservation}
        </Typography>
        <Typography sx={{ color: '#333333', marginBottom: 1 }}>
          <strong>Date de récupération :</strong> {reservation.dateRecuperation}
        </Typography>
        <Typography sx={{ color: '#333333', marginBottom: 1 }}>
          <strong>État :</strong>{' '}
          {statusLabels[reservation.etatReservation] ||
            reservation.etatReservation}
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{
          color: '#2e7d32',
          fontWeight: 'bold',
          marginBottom: 2,
        }}
      >
        Articles réservés
      </Typography>

      {reservation.reservationLotsProduits.length === 0 ? (
        <StyledAlert severity="info">
          Aucun article dans cette réservation.
        </StyledAlert>
      ) : (
        <Grid container spacing={2}>
          {reservation.reservationLotsProduits.map((item, index) => {
            const lotId = item.lot?.idLot;
            const lot = lotId ? lots.get(lotId) : null;

            if (!lotId || !lot) {
              return (
                <Grid item xs={12} key={index}>
                  <StyledAlert severity="warning">
                    Article non disponible (Lot ID: {lotId || 'inconnu'},
                    Quantité: {item.quantite})
                  </StyledAlert>
                </Grid>
              );
            }

            return (
              <Grid item xs={12} key={index}>
                <StyledCard>
                  <Box sx={{ display: 'flex' }}>
                    <CardMedia
                      component="img"
                      sx={{
                        width: 150,
                        objectFit: 'cover',
                        borderRadius: '12px 0 0 12px',
                      }}
                      image={lot?.photo?.url || logo}
                      alt={lot?.product?.libelleProduct || 'Produit'}
                    />
                    <CardContent sx={{ flex: 1, padding: '1.5rem' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#2e7d32',
                          fontWeight: 'bold',
                          marginBottom: 1,
                        }}
                      >
                        {lot?.product?.libelleProduct || 'Produit non spécifié'}
                      </Typography>
                      <Typography sx={{ color: '#333333', marginBottom: 1 }}>
                        <strong>Quantité :</strong> {item.quantite}
                      </Typography>
                      <Typography sx={{ color: '#333333', marginBottom: 1 }}>
                        <strong>Prix unitaire :</strong>{' '}
                        {lot?.price ? `${lot.price.toFixed(2)} €` : 'N/A'}
                      </Typography>
                      <Typography sx={{ color: '#333333', marginBottom: 1 }}>
                        <strong>Sous-total :</strong>{' '}
                        {lot?.price
                          ? `${(lot.price * item.quantite).toFixed(2)} €`
                          : 'N/A'}
                      </Typography>
                      <Typography sx={{ color: '#333333' }}>
                        <strong>Producteur :</strong>{' '}
                        {lot?.producer?.companyName || 'Inconnu'} (
                        {lot?.producer?.email || 'N/A'})
                      </Typography>
                    </CardContent>
                  </Box>
                </StyledCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Box sx={{ marginTop: 3, textAlign: 'right' }}>
        <Typography
          variant="h5"
          sx={{ color: '#2e7d32', fontWeight: 'bold', marginBottom: 1 }}
        >
          Total :{' '}
          {reservation.reservationLotsProduits
            .reduce((total, item) => {
              const lotId = item.lot?.idLot;
              const lot = lotId ? lots.get(lotId) : null;
              return total + (lot?.price || 0) * item.quantite;
            }, 0)
            .toFixed(2)}{' '}
          €
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
        <GreenButton
          variant="contained"
          onClick={() => navigate('/my-reservations')}
        >
          Retour aux réservations
        </GreenButton>
        {/* Bouton Annuler uniquement pour les réservations non annulées et non récupérées */}
        {reservation.etatReservation !== 'CANCELLED' &&
          reservation.etatReservation.toLowerCase() !== 'récupérée' && (
            <StyledCancelButton
              variant="contained"
              onClick={handleCancelReservation}
            >
              Annuler la réservation
            </StyledCancelButton>
          )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir annuler cette réservation ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Non</Button>
          <Button onClick={confirmCancel} sx={{ color: '#2e7d32' }}>
            Oui
          </Button>
        </DialogActions>
      </Dialog>
    </GreenContainer>
  );
};

export default ReservationDetailsPage;
