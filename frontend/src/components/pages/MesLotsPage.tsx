import { useContext } from 'react';
import { LotContext } from '../../contexts/LotContext';
import {
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Box,
} from '@mui/material';
import { Lot, LotContextType, UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const MesLotsPage = () => {
  const { availableLots, error, loading } = useContext(
    LotContext,
  ) as LotContextType;
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  const navigate = useNavigate();

  const handleModifyLot = (lotId: number | undefined) => {
    if (lotId !== undefined) {
      navigate(`/lot-details/${lotId}`);
    } else {
      console.error("L'ID du lot est undefined, impossible de naviguer.");
    }
  };

  // Vérifier si l'utilisateur est connecté et est un producteur
  if (!authenticatedUser) {
    return (
      <Box display="flex" justifyContent="center" marginTop="2rem">
        <Alert severity="error">
          Vous devez être connecté pour voir vos lots.
        </Alert>
      </Box>
    );
  }

  if (authenticatedUser.role !== 'PRODUCTEUR') {
    return (
      <Box display="flex" justifyContent="center" marginTop="2rem">
        <Alert severity="error">
          Accès refusé : cette page est réservée aux producteurs.
        </Alert>
      </Box>
    );
  }

  const waiting = availableLots.filter(
    (lot: Lot) =>
      lot.lotStatus === 'en attente' &&
      lot.producer.userId === authenticatedUser.id,
  );

  const availableLotsForReservation = availableLots.filter(
    (lot: Lot) =>
      lot.lotStatus === 'en vente' &&
      lot.remainingQuantity > 0 &&
      lot.producer.userId === authenticatedUser.id,
  );

  const soldLotsWithRemainingZero = availableLots.filter(
    (lot: Lot) =>
      lot.lotStatus === 'en vente' &&
      lot.remainingQuantity === 0 &&
      lot.producer.userId === authenticatedUser.id,
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" marginTop="2rem">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" marginTop="2rem">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: '2rem', backgroundColor: '#f9f9f9' }}>
      <Typography variant="h3" gutterBottom sx={{ color: '#4CAF50' }}>
        Bienvenue sur la plateforme de vente de produits locaux
      </Typography>

      <Typography variant="h4" gutterBottom sx={{ marginTop: '2rem' }}>
        Lots disponibles à la réservation
      </Typography>
      <Grid container spacing={3}>
        {availableLotsForReservation.map((lot: Lot) => (
          <Grid item xs={12} sm={6} md={4} key={lot.idLot}>
            <Card sx={{ boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="100"
                image={lot.photo?.url}
                alt={lot.product?.libelleProduct || 'Produit'}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {lot.product?.libelleProduct}
                </Typography>
                <Typography>Prix : {lot.price} €</Typography>
                <Typography>
                  Quantité disponible : {lot.initialQuantity}
                </Typography>
                <Typography>
                  Producteur : {lot.producer.companyName} ({lot.producer.email})
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleModifyLot(lot.idLot)}
                  sx={{ marginTop: '1rem' }}
                  disabled={lot.idLot === undefined}
                >
                  Modifier
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" gutterBottom sx={{ marginTop: '2rem' }}>
        Lots vendus
      </Typography>
      <Grid container spacing={3}>
        {soldLotsWithRemainingZero.map((lot: Lot) => (
          <Grid item xs={12} sm={6} md={4} key={lot.idLot}>
            <Card sx={{ boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="100"
                image={lot.photo?.url}
                alt={lot.product?.libelleProduct || 'Produit'}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {lot.product?.libelleProduct}
                </Typography>
                <Typography>Prix : {lot.price} €</Typography>
                <Typography>Quantité vendue : {lot.soldQuantity}</Typography>
                <Typography>
                  Producteur : {lot.producer.companyName} ({lot.producer.email})
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleModifyLot(lot.idLot)}
                  sx={{ marginTop: '1rem' }}
                  disabled={lot.idLot === undefined}
                >
                  Voir
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" gutterBottom sx={{ marginTop: '2rem' }}>
        Lots en attente d'être acceptés
      </Typography>
      <Grid container spacing={3}>
        {waiting.map((lot: Lot) => (
          <Grid item xs={12} sm={6} md={4} key={lot.idLot}>
            <Card sx={{ boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="100"
                image={lot.photo?.url}
                alt={lot.product?.libelleProduct || 'Produit'}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {lot.product?.libelleProduct}
                </Typography>
                <Typography>Prix : {lot.price} €</Typography>
                <Typography>
                  Quantité disponible : {lot.initialQuantity}
                </Typography>
                <Typography>
                  Producteur : {lot.producer.companyName} ({lot.producer.email})
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleModifyLot(lot.idLot)}
                  sx={{ marginTop: '1rem' }}
                  disabled={lot.idLot === undefined}
                >
                  Voir
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MesLotsPage;
