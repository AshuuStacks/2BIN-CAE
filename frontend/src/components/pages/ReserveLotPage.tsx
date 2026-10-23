import { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import {
  Typography,
  TextField,
  Button,
  Container,
  Box,
  Alert,
  styled,
} from '@mui/material';

const GreenContainer = styled(Container)(() => ({
  padding: 4,
  backgroundColor: '#f5f5f5', // Fond vert très clair
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)', // Ombre verte légère
  minHeight: '400px', // Hauteur minimale pour le contenu
}));

const GreenButton = styled(Button)(() => ({
  backgroundColor: '#2e7d32', // Vert profond
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#1b5e20', // Vert plus foncé au hover
  },
  borderRadius: 8,
  padding: '12px 24px',
  fontWeight: 'bold',
  textTransform: 'none',
  margin: '0 8px', // Espacement entre les boutons
}));

const GreenTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#4caf50', // Bordure verte
    },
    '&:hover fieldset': {
      borderColor: '#2e7d32', // Vert plus foncé au hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2e7d32', // Vert profond quand actif
    },
  },
  '& .MuiInputLabel-root': {
    color: '#2e7d32', // Label vert
    '&.Mui-focused': {
      color: '#2e7d32', // Label vert quand le champ est actif
    },
  },
  '& .MuiInput-input': {
    color: '#333333', // Texte neutre pour lisibilité
  },
}));

const StyledAlert = styled(Alert)(() => ({
  backgroundColor: '#e8f5e9', // Fond vert clair
  color: '#2e7d32', // Texte vert
  border: '1px solid #4caf50', // Bordure verte
  borderRadius: 8,
  marginTop: 2,
}));

const ReserveLotPage = () => {
  const { authenticatedUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { lot } = location.state;

  const [quantity, setQuantity] = useState(1);
  const [recuperationDate, setRecuperationDate] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(
    null,
  );

  useEffect(() => {
    if (!authenticatedUser || authenticatedUser.role !== 'CLIENT') {
      setMessage(
        'Vous devez être connecté en tant que client pour effectuer une réservation.',
      );
      setMessageType('error');
      navigate('/login');
    }
  }, [authenticatedUser, navigate]);

  const handleReserve = async () => {
    const today = new Date().toISOString().split('T')[0];
    const availableDate = lot.availableDate;

    // Validation locale des dates
    if (!recuperationDate) {
      setMessage('Veuillez sélectionner une date de récupération.');
      setMessageType('error');
      return;
    }
    if (new Date(recuperationDate) < new Date(today)) {
      setMessage(
        'La date de récupération ne peut pas être antérieure à aujourd’hui.',
      );
      setMessageType('error');
      return;
    }
    if (new Date(recuperationDate) < new Date(availableDate)) {
      setMessage(
        'La date de récupération doit être postérieure ou égale à la date de disponibilité du lot.',
      );
      setMessageType('error');
      return;
    }

    try {
      const body = {
        dateReservation: today,
        dateRecuperation: recuperationDate,
        etatReservation: 'Réservée',
        reservationLotsProduits: [
          {
            lotId: { idLot: lot.idLot },
            quantite: quantity,
          },
        ],
      };

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticatedUser?.token || ''}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setMessage('Réservation effectuée avec succès !');
        setMessageType('success');
        setTimeout(() => navigate('/my-reservations'), 2000);
      } else {
        const errorText = await response.text();
        console.error('Erreur du serveur :', response.status, errorText);
        setMessage(`Erreur lors de la réservation : ${errorText}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Erreur lors de la réservation :', error);
      setMessage('Une erreur est survenue lors de la réservation.');
      setMessageType('error');
    }
  };

  return (
    <GreenContainer maxWidth="sm">
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
        Réserver le lot : {lot.product?.libelleProduct}
      </Typography>
      <Typography sx={{ color: '#333333', marginBottom: 1 }}>
        Prix : {lot.price} €
      </Typography>
      <Typography sx={{ color: '#333333', marginBottom: 2 }}>
        Quantité disponible : {lot.remainingQuantity}
      </Typography>

      {message && (
        <Box sx={{ marginBottom: 2 }}>
          <StyledAlert severity={messageType || 'error'}>{message}</StyledAlert>
        </Box>
      )}

      <Box sx={{ marginBottom: 3 }}>
        <GreenTextField
          label="Quantité"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          inputProps={{ min: 1, max: lot.remainingQuantity }}
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }} // Force le label à être sur la bordure
        />
      </Box>
      <Box sx={{ marginBottom: 3 }}>
        <GreenTextField
          label="Date de récupération"
          type="date"
          value={recuperationDate}
          onChange={(e) => setRecuperationDate(e.target.value)}
          fullWidth
          variant="outlined"
          InputLabelProps={{ shrink: true }} // Force le label à être sur la bordure
          inputProps={{ min: lot.availableDate }}
        />
      </Box>

      {/* Disposition des boutons côte à côte */}
      <Box
        sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}
      >
        <GreenButton variant="contained" onClick={handleReserve}>
          Confirmer la réservation
        </GreenButton>
        <GreenButton variant="contained" onClick={() => navigate('/')}>
          Retour
        </GreenButton>
      </Box>
    </GreenContainer>
  );
};

export default ReserveLotPage;
