import { useContext, useEffect, useState } from 'react';
import { ReservationContext } from '../../contexts/ReservationContext';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  styled,
  Button,
} from '@mui/material';

// Map backend status to French labels
const statusLabels: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CANCELLED: 'Annulée',
  récupérée: 'Récupérée',
  annulée: 'Annulée',
  abandonnée: 'Abandonnée',
  reservée: 'Réservée', // Ajouté pour couvrir un état possible
};

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

const StyledAlert = styled(Alert)(() => ({
  backgroundColor: '#e8f5e9',
  color: '#2e7d32',
  border: '1px solid #4caf50',
  borderRadius: 8,
  marginBottom: 2,
}));

const StyledButton = styled(Button)(() => ({
  backgroundColor: '#2e7d32',
  color: '#ffffff',
  borderRadius: 8,
  padding: '8px 16px',
  fontWeight: 'bold',
  textTransform: 'none',
  marginTop: 2,
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
}));

const MyReservationsPage = () => {
  const reservationContext = useContext(ReservationContext);
  const { authenticatedUser } = useContext(UserContext);
  const navigate = useNavigate();

  const { reservations, fetchReservations } = reservationContext || {};

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!authenticatedUser) {
        setMessage('Veuillez vous connecter pour voir vos réservations.');
        setMessageType('error');
        setLoading(false);
        return;
      }

      if (fetchReservations && authenticatedUser.id !== undefined) {
        try {
          setLoading(true);
          await fetchReservations(authenticatedUser.id);
          setMessage('Réservations chargées avec succès !');
          setMessageType('success');
        } catch (error) {
          console.error(
            'Erreur lors de la récupération des réservations:',
            error,
          );
          setMessage(
            error instanceof Error
              ? error.message
              : 'Erreur lors de la récupération des réservations.',
          );
          setMessageType('error');
        } finally {
          setLoading(false);
        }
      } else {
        setMessage(
          'ID utilisateur manquant ou contexte de réservation indisponible.',
        );
        setMessageType('error');
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchReservations, authenticatedUser]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!reservationContext) {
    return (
      <Box sx={{ marginTop: '2rem', padding: 2 }}>
        <StyledAlert severity="error">
          Le contexte des réservations n'est pas disponible. Assurez-vous que le
          `ReservationProvider` enveloppe ce composant.
        </StyledAlert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f7f5',
        }}
      >
        <CircularProgress style={{ color: '#2e7d32' }} />
      </Box>
    );
  }

  if (!reservations) {
    return (
      <Box sx={{ marginTop: '2rem', padding: 2 }}>
        <StyledAlert severity="error">
          Les réservations n'ont pas pu être chargées.
        </StyledAlert>
      </Box>
    );
  }

  // Filtrer les réservations pour "Mes Réservations Passées" (annulée, abandonnée, récupérée)
  const pastReservations = reservations.filter((reservation) =>
    ['annulée', 'abandonnée', 'récupérée'].includes(
      reservation.etatReservation.toLowerCase(),
    ),
  );

  // Filtrer les réservations pour "Mes Réservations" (exclure annulée, abandonnée, récupérée)
  const currentReservations = reservations.filter(
    (reservation) =>
      !['annulée', 'abandonnée', 'récupérée'].includes(
        reservation.etatReservation.toLowerCase(),
      ),
  );

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f7f5', minHeight: '100vh' }}>
      {message && (
        <Box sx={{ marginBottom: 3 }}>
          <StyledAlert severity={messageType || 'error'}>{message}</StyledAlert>
        </Box>
      )}

      {/* Section des réservations en cours */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          color: '#2e7d32',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(46, 125, 50, 0.2)',
          marginBottom: 4,
        }}
      >
        Mes Réservations
      </Typography>

      {currentReservations.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#333333',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              padding: 3,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              maxWidth: '500px',
              width: '100%',
              border: '2px solid #4caf50',
            }}
          >
            Vous n'avez aucune réservation en cours pour le moment.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentReservations.map((reservation) => (
            <Grid item xs={12} sm={6} md={4} key={reservation.idReservation}>
              <StyledCard>
                <CardContent
                  sx={{
                    padding: 3,
                    backgroundColor: '#ffffff',
                    borderRadius: '0 0 12px 12px',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#2e7d32',
                      marginBottom: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    Réservation #{reservation.idReservation}
                  </Typography>
                  <Typography sx={{ color: '#333333', marginBottom: 1 }}>
                    Date de réservation : {reservation.dateReservation}
                  </Typography>
                  <Typography sx={{ color: '#333333', marginBottom: 1 }}>
                    Date de récupération : {reservation.dateRecuperation}
                  </Typography>
                  <Typography sx={{ color: '#333333', marginBottom: 2 }}>
                    État :{' '}
                    {statusLabels[reservation.etatReservation] ||
                      reservation.etatReservation}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <StyledButton
                      variant="contained"
                      onClick={() =>
                        navigate(
                          `/reservation-details/${reservation.idReservation}`,
                        )
                      }
                    >
                      Voir les détails
                    </StyledButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Section des réservations passées */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          color: '#2e7d32',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(46, 125, 50, 0.2)',
          marginTop: 6,
          marginBottom: 4,
        }}
      >
        Mes Réservations Passées
      </Typography>

      {pastReservations.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#333333',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              padding: 3,
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              maxWidth: '500px',
              width: '100%',
              border: '2px solid #4caf50',
            }}
          >
            Vous n'avez aucune réservation passée pour le moment.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {pastReservations.map((reservation) => (
            <Grid item xs={12} sm={6} md={4} key={reservation.idReservation}>
              <StyledCard>
                <CardContent
                  sx={{
                    padding: 3,
                    backgroundColor: '#ffffff',
                    borderRadius: '0 0 12px 12px',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#2e7d32',
                      marginBottom: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    Réservation #{reservation.idReservation}
                  </Typography>
                  <Typography sx={{ color: '#333333', marginBottom: 1 }}>
                    Date de réservation : {reservation.dateReservation}
                  </Typography>
                  <Typography sx={{ color: '#333333', marginBottom: 1 }}>
                    Date de récupération : {reservation.dateRecuperation}
                  </Typography>
                  <Typography sx={{ color: '#333333', marginBottom: 2 }}>
                    État :{' '}
                    {statusLabels[reservation.etatReservation] ||
                      reservation.etatReservation}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <StyledButton
                      variant="contained"
                      onClick={() =>
                        navigate(
                          `/reservation-details/${reservation.idReservation}`,
                        )
                      }
                    >
                      Voir les détails
                    </StyledButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyReservationsPage;
