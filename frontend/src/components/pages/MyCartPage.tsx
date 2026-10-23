import { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
  IconButton,
  Divider,
  TextField,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/nopic.jpg';
import { ReservationContext } from '../../contexts/ReservationContext';
import { UserContext } from '../../contexts/UserContext';
import {
  UserContextType,
  ReservationContextType,
  Lot,
  ReservationLotProduit,
} from '../../types';

// Types pour le panier
interface CartItem {
  lot: Lot;
  quantity: number;
}

const MyCartPage = () => {
  const navigate = useNavigate();
  const { authenticatedUser } = useContext(UserContext) as UserContextType;
  const { createReservation } = useContext(
    ReservationContext,
  ) as ReservationContextType;

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
      console.error('Erreur lors du parsing du panier:', err);
      return [];
    }
  });
  const [pickupDate, setPickupDate] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>(
    'success',
  );
  const [error, setError] = useState<string | null>(null);

  // Générer les options de date pour les 3 jours suivants
  const getDateOptions = () => {
    const options: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      options.push(formattedDate);
    }
    return options;
  };

  // Formatter la date pour l'affichage
  const formatDisplayDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`; // Format DD/MM/YYYY
  };

  // Mettre à jour localStorage quand cartItems change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calcul du total
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.lot.price * item.quantity, 0)
      .toFixed(2);
  };

  // Gérer la mise à jour de la quantité
  const handleQuantityChange = (lotId: number, newQuantity: number) => {
    const foundItem = cartItems.find((item) => item.lot.idLot === lotId);
    if (
      newQuantity >= 0 &&
      foundItem &&
      newQuantity <= foundItem.lot.remainingQuantity
    ) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.lot.idLot === lotId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  // Gérer la suppression d'un article
  const handleRemoveItem = (lotId: number) => {
    const removedItem = cartItems.find((item) => item.lot.idLot === lotId);
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.lot.idLot !== lotId),
    );
    if (removedItem) {
      setSnackbarMessage(
        `${removedItem.lot.product.libelleProduct} supprimé du panier !`,
      );
      setSnackbarType('success');
      setSnackbarOpen(true);
    }
  };

  // Gérer la réservation
  const handleCheckout = async () => {
    if (!pickupDate) {
      setError('Veuillez sélectionner une date de récupération.');
      return;
    }
    if (
      !authenticatedUser ||
      !authenticatedUser.id ||
      !authenticatedUser.token
    ) {
      setError('Utilisateur non authentifié.');
      return;
    }
    if (authenticatedUser.role !== 'CLIENT') {
      setError('Seuls les clients peuvent effectuer des réservations.');
      return;
    }

    try {
      console.log('Utilisateur authentifié:', authenticatedUser); // Débogage
      const reservationItems: ReservationLotProduit[] = cartItems.map(
        (item) => ({
          lot: item.lot, // Include the full lot object
          lotId: { idLot: item.lot.idLot! },
          quantite: item.quantity,
        }),
      );

      await createReservation(
        authenticatedUser.id,
        pickupDate,
        reservationItems,
      );

      // Vider le panier après une réservation réussie
      setCartItems([]);
      localStorage.removeItem('cart');

      // Afficher un message de succès
      setSnackbarMessage('Réservation effectuée avec succès !');
      setSnackbarType('success');
      setSnackbarOpen(true);

      // Rediriger vers la page des réservations
      navigate('/my-reservations');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && err.message.includes('403')
          ? 'Accès interdit : veuillez vérifier votre authentification ou votre rôle.'
          : err instanceof Error && err.message.includes('400')
            ? 'Erreur dans les données envoyées. Vérifiez la date ou les quantités.'
            : 'Impossible de finaliser la réservation. Veuillez réessayer.';
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarType('error');
      setSnackbarOpen(true);
      console.error('Erreur lors de la réservation:', err);
    }
  };

  // Fermer le Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{ padding: '2rem', backgroundColor: '#f9f9f9', minHeight: '100vh' }}
    >
      <Typography variant="h3" gutterBottom sx={{ color: '#4CAF50' }}>
        Mon Panier
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      {cartItems.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          marginTop="2rem"
        >
          <Alert severity="info" sx={{ marginBottom: '1rem' }}>
            Votre panier est vide.
          </Alert>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate('/')}
            sx={{ padding: '0.75rem 2rem' }}
          >
            Découvrir les produits
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Liste des articles */}
          <Grid item xs={12} md={8}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ marginBottom: '1.5rem' }}
            >
              Vos articles
            </Typography>
            {cartItems.map((item) => (
              <Card
                key={item.lot.idLot}
                sx={{
                  display: 'flex',
                  marginBottom: '1rem',
                  boxShadow: 3,
                  borderRadius: '8px',
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 150, objectFit: 'cover' }}
                  image={item.lot.photo?.url || logo}
                  alt={item.lot.product.libelleProduct}
                />
                <CardContent sx={{ flex: 1, padding: '1.5rem' }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', marginBottom: '0.5rem' }}
                  >
                    {item.lot.product.libelleProduct}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ marginBottom: '0.5rem' }}
                  >
                    Producteur : {item.lot.producer.companyName}
                  </Typography>
                  <Typography sx={{ marginBottom: '0.5rem' }}>
                    Prix unitaire : {item.lot.price.toFixed(2)} €
                  </Typography>
                  <Typography sx={{ marginBottom: '1rem' }}>
                    Sous-total : {(item.lot.price * item.quantity).toFixed(2)} €
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <TextField
                      type="number"
                      label="Quantité"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.lot.idLot!,
                          parseInt(e.target.value) || 0,
                        )
                      }
                      inputProps={{ min: 0, max: item.lot.remainingQuantity }}
                      size="small"
                      sx={{ width: '100px', marginRight: '1rem' }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(item.lot.idLot!)}
                      aria-label="Supprimer l'article"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* Récapitulatif */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                boxShadow: 3,
                padding: '1.5rem',
                borderRadius: '8px',
                backgroundColor: '#fff',
              }}
            >
              <Typography variant="h4" gutterBottom>
                Récapitulatif
              </Typography>
              <Divider sx={{ marginBottom: '1rem' }} />
              <Box
                display="flex"
                justifyContent="space-between"
                marginBottom="0.5rem"
              >
                <Typography variant="body1">Nombre d'articles :</Typography>
                <Typography variant="body1">{cartItems.length}</Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                marginBottom="1.5rem"
              >
                <Typography variant="body1" fontWeight="bold">
                  Total :
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {calculateTotal()} €
                </Typography>
              </Box>
              <FormControl fullWidth sx={{ marginBottom: '1rem' }}>
                <InputLabel
                  id="pickup-date-label"
                  sx={{ color: 'black', '&.Mui-focused': { color: 'black' } }}
                >
                  Date de récupération
                </InputLabel>
                <Select
                  labelId="pickup-date-label"
                  value={pickupDate}
                  label="Date de récupération"
                  onChange={(e) => setPickupDate(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2e7d32',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1b5e20',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1b5e20',
                    },
                    '& .MuiSelect-icon': {
                      color: '#2e7d32',
                    },
                    '& .MuiSelect-select': {
                      color: 'black',
                    },
                    borderRadius: '8px',
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            backgroundColor: '#e8f5e9',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#d4e7d4',
                          },
                        },
                      },
                    },
                  }}
                >
                  {getDateOptions().map((date) => (
                    <MenuItem key={date} value={date} sx={{ color: 'black' }}>
                      {formatDisplayDate(date)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleCheckout}
                sx={{ padding: '0.75rem', fontSize: '1rem' }}
                disabled={!pickupDate}
              >
                Réserver la commande
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Snackbar pour confirmation de réservation ou suppression */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarType}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyCartPage;
