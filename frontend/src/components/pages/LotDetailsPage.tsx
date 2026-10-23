import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  styled,
} from '@mui/material';
import { LotContext } from '../../contexts/LotContext';
import { UserContext } from '../../contexts/UserContext';
import { Lot, LotContextType, UserContextType } from '../../types';

const GreenContainer = styled(Box)(() => ({
  padding: 4,
  backgroundColor: '#f5f7f5',
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.1)',
  position: 'relative',
  minHeight: '400px',
}));

const GreenButton = styled(Button)(() => ({
  backgroundColor: '#2e7d32',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
  borderRadius: 8,
  padding: '12px 24px',
  fontWeight: 'bold',
  textTransform: 'none',
}));

const StyledAlert = styled(Alert)(() => ({
  backgroundColor: '#e8f5e9',
  color: '#2e7d32',
  border: '1px solid #4caf50',
  borderRadius: 8,
  marginTop: 2,
}));

const LotDetailsPage = () => {
  const { idLot } = useParams<{ idLot: string }>();
  const { getLotById } = useContext(LotContext) as LotContextType;
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [lot, setLot] = useState<Lot | null>(location.state?.lot || null);
  const [loading, setLoading] = useState(!location.state?.lot);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLot = async () => {
      if (!lot && idLot) {
        setLoading(true);
        const fetchedLot = await getLotById(parseInt(idLot));
        if (fetchedLot) {
          setLot(fetchedLot);
        } else {
          setError('Lot non trouvé.');
        }
        setLoading(false);
      }
    };
    fetchLot();
  }, [idLot, getLotById, lot]);

  const handleReserve = () => {
    if (lot) {
      navigate('/reserve-lot', { state: { lot } });
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

  if (error || !lot) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}
      >
        <StyledAlert severity="error">{error || 'Lot non trouvé.'}</StyledAlert>
      </Box>
    );
  }

  return (
    <GreenContainer maxWidth="md">
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
        Détails du lot : {lot.product?.libelleProduct}
      </Typography>

      <Box sx={{ display: 'flex', gap: 4 }}>
        <Box>
          <img
            src={lot.photo?.url || '/assets/images/nopic.jpg'}
            alt={lot.product?.libelleProduct}
            style={{ maxWidth: '300px', borderRadius: '8px' }}
          />
        </Box>
        <Box>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Prix :</strong> {lot.price} €
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Quantité initiale :</strong> {lot.initialQuantity}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Quantité vendue :</strong> {lot.soldQuantity}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Quantité réservée :</strong> {lot.reservedQuantity}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Quantité restante :</strong> {lot.remainingQuantity}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Quantité retirée :</strong> {lot.withdrawnQuantity}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Statut :</strong> {lot.lotStatus}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Date de disponibilité :</strong> {lot.availableDate}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Date de proposition :</strong> {lot.proposalDate}
          </Typography>
          {lot.receptionDate && (
            <Typography sx={{ color: '#333333', marginBottom: 1 }}>
              <strong>Date de réception :</strong> {lot.receptionDate}
            </Typography>
          )}
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Type de produit :</strong>{' '}
            {lot.product?.productType?.libelleType}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Unité :</strong> {lot.product?.unite?.unite}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Description :</strong> {lot.product?.description}
          </Typography>
          <Typography sx={{ color: '#333333', marginBottom: 1 }}>
            <strong>Producteur :</strong> {lot.producer?.companyName} (
            {lot.producer?.email})
          </Typography>
        </Box>
      </Box>

      <Box sx={{ marginTop: 3 }}>
        {authenticatedUser?.role === 'CLIENT' && lot.remainingQuantity > 0 && (
          <GreenButton variant="contained" onClick={handleReserve}>
            Réserver ce lot
          </GreenButton>
        )}
        {authenticatedUser?.role === 'CLIENT' && (
          <GreenButton
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ marginLeft: 2 }}
          >
            Retour à la page d'accueil
          </GreenButton>
        )}
        {authenticatedUser?.role === 'PRODUCTEUR' && (
          <GreenButton
            variant="contained"
            onClick={() => navigate('/my-lots')}
            sx={{ marginLeft: 2 }}
          >
            Mes lots
          </GreenButton>
        )}
      </Box>
    </GreenContainer>
  );
};

export default LotDetailsPage;
