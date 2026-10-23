import { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { LotContext } from '../../contexts/LotContext';
import { Lot, LotContextType, UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';

// Styles pour le bouton
const GreenHighlightButton = styled(Button)(() => ({
  backgroundColor: '#00a152',
  '&:hover': {
    backgroundColor: '#00843d',
  },
  padding: '10px 20px',
  fontSize: '16px',
  fontWeight: 'bold',
  textTransform: 'none',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 161, 82, 0.4)',
}));

// Style commun pour toutes les cartes
const CommonCard = styled(Card)(() => ({
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.3)',
  },
  backgroundColor: '#f9faf9',
  border: '2px solid #4caf50',
  cursor: 'pointer',
  width: '100%',
  minHeight: '300px',
}));

interface CartItem {
  lot: Lot;
  quantity: number;
}

const HomePage = () => {
  const { availableLots, error, loading } = useContext(
    LotContext,
  ) as LotContextType;
  const { authenticatedUser } = useContext(UserContext) as UserContextType;
  const navigate = useNavigate();

  const [productNameFilter, setProductNameFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [recentLots, setRecentLots] = useState<Lot[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Référence pour le carrousel
  const carouselRef = useRef<HTMLDivElement>(null);

  // Mettre à jour localStorage quand le panier change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Filtrer les lots récents à partir de availableLots
  useEffect(() => {
    const filteredRecentLots = availableLots
      .filter(
        (lot) => lot.lotStatus === 'en vente' && lot.remainingQuantity > 0,
      )
      .sort((a, b) => {
        return (
          new Date(b.proposalDate).getTime() -
          new Date(a.proposalDate).getTime()
        );
      })
      .slice(0, 10);
    setRecentLots(filteredRecentLots);
  }, [availableLots]);

  // Défilement automatique du carrousel
  useEffect(() => {
    if (!carouselRef.current || recentLots.length === 0) return;

    const totalPairs = Math.ceil(recentLots.length / 2);
    let currentIndex = 0;

    const scrollToIndex = (index: number) => {
      if (carouselRef.current) {
        const scrollAmount = carouselRef.current.clientWidth * index;
        carouselRef.current.scrollTo({
          left: scrollAmount,
          behavior: 'smooth',
        });
      }
    };

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % totalPairs;
      scrollToIndex(currentIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [recentLots]);

  // Fonction pour ajouter un lot au panier
  const addToCart = (lot: Lot) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.lot.idLot === lot.idLot,
      );
      if (existingItem) {
        if (existingItem.quantity < lot.remainingQuantity) {
          return prevCart.map((item) =>
            item.lot.idLot === lot.idLot
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return prevCart;
      }
      return [...prevCart, { lot, quantity: 1 }];
    });
    setAlertMessage(`${lot.product.libelleProduct} ajouté au panier !`);
    setAlertOpen(true);
    setTimeout(() => setAlertOpen(false), 3000);
  };

  // Naviguer vers le panier
  const goToCart = () => {
    navigate('/cart', { state: { cart } });
  };

  // Naviguer vers la page de détails
  const handleLotClick = (lot: Lot) => {
    navigate(`/lot-details/${lot.idLot}`, { state: { lot } });
  };

  const filteredLots = availableLots.filter((lot: Lot) => {
    const matchesName =
      productNameFilter === '' ||
      lot.product.libelleProduct
        .toLowerCase()
        .includes(productNameFilter.toLowerCase());
    const matchesType =
      productTypeFilter === '' ||
      lot.product.productType.libelleType === productTypeFilter;
    return matchesName && matchesType;
  });

  const availableLotsForReservation = filteredLots.filter(
    (lot: Lot) => lot.lotStatus === 'en vente' && lot.remainingQuantity > 0,
  );
  const soldLotsWithRemainingZero = filteredLots.filter(
    (lot: Lot) => lot.lotStatus === 'en vente' && lot.remainingQuantity === 0,
  );

  const carouselItems = recentLots;

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', padding: '16px 0' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2e7d32', px: 2 }}>
        Derniers lots ajoutés
      </Typography>

      {recentLots.length === 0 ? (
        <Typography sx={{ px: 2 }}>Aucun lot récent disponible.</Typography>
      ) : (
        <Box
          ref={carouselRef}
          sx={{
            display: 'flex',
            overflowX: 'scroll',
            scrollSnapType: 'x mandatory',
            marginBottom: 4,
            width: '100%',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {[...Array(Math.ceil(carouselItems.length / 2))].map(
            (_, pairIndex) => (
              <Box
                key={pairIndex}
                sx={{
                  display: 'flex',
                  scrollSnapAlign: 'start',
                  minWidth: '100%',
                  width: '100%',
                }}
              >
                {carouselItems
                  .slice(pairIndex * 2, pairIndex * 2 + 2)
                  .map((lot: Lot, index: number) => (
                    <Box
                      sx={{ width: '50%', padding: '0 8px' }}
                      key={`${lot.idLot}-${index}`}
                    >
                      <CommonCard
                        data-testid="lot-card"
                        onClick={() => handleLotClick(lot)}
                      >
                        <img
                          src={lot.photo?.url}
                          alt={lot.product.libelleProduct}
                          style={{
                            width: '100%',
                            height: '250px',
                            objectFit: 'cover',
                          }}
                        />
                        <CardContent sx={{ padding: 2 }}>
                          <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                            {lot.product.libelleProduct}
                          </Typography>
                          <Typography sx={{ fontSize: '1rem' }}>
                            Prix : {lot.price} €
                          </Typography>
                          <Typography sx={{ fontSize: '1rem' }}>
                            Disponible : {lot.remainingQuantity}
                          </Typography>
                        </CardContent>
                      </CommonCard>
                    </Box>
                  ))}
              </Box>
            ),
          )}
        </Box>
      )}

      <Typography variant="h4" gutterBottom sx={{ color: '#2e7d32', px: 2 }}>
        Lots disponibles à la réservation
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1rem',
          px: 2,
        }}
      >
        <IconButton
          onClick={goToCart}
          sx={{ color: '#2e7d32', '&:hover': { color: '#1b5e20' } }}
          aria-label="Voir le panier"
        >
          <ShoppingCartIcon fontSize="large" />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          marginBottom: 3,
          flexWrap: 'wrap',
          px: 2,
        }}
      >
        <TextField
          label="Nom du produit"
          variant="outlined"
          value={productNameFilter}
          onChange={(e) => setProductNameFilter(e.target.value)}
          fullWidth
          color="success"
        />
        <ToggleButtonGroup
          value={productTypeFilter}
          exclusive
          onChange={(_e, newValue) => setProductTypeFilter(newValue || '')}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            width: '100%',
            '& .MuiToggleButtonGroup-grouped': {
              borderColor: '#4caf50',
              color: '#2e7d32',
              backgroundColor: '#e8f5e9',
              '&.Mui-selected': {
                backgroundColor: '#2e7d32',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#1b5e20' },
              },
              '&:hover': { backgroundColor: '#c8e6c9' },
            },
          }}
        >
          <ToggleButton value="">Tous</ToggleButton>
          <ToggleButton value="Légumes">Légumes</ToggleButton>
          <ToggleButton value="Fruits">Fruits</ToggleButton>
          <ToggleButton value="Produits laitiers">
            Produits laitiers
          </ToggleButton>
          <ToggleButton value="Boulangerie">Boulangerie</ToggleButton>
          <ToggleButton value="Viande">Viande</ToggleButton>
          <ToggleButton value="Boissons">Boissons</ToggleButton>
          <ToggleButton value="Autres">Autres</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2} sx={{ px: 2 }}>
        {availableLotsForReservation.map((lot: Lot) => (
          <Grid item xs={12} sm={6} md={4} key={lot.idLot}>
            <CommonCard
              data-testid="lot-card"
              onClick={() => handleLotClick(lot)}
            >
              <img
                src={lot.photo?.url}
                alt={lot.product.libelleProduct}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                }}
              />
              <CardContent>
                <Typography variant="h6">
                  {lot.product.libelleProduct}
                </Typography>
                <Typography>Prix : {lot.price} €</Typography>
                <Typography>
                  Quantité disponible : {lot.remainingQuantity}
                </Typography>
                {authenticatedUser?.role === 'CLIENT' && (
                  <Box sx={{ marginTop: '1rem' }}>
                    <GreenHighlightButton
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(lot);
                      }}
                      disabled={lot.remainingQuantity === 0}
                      data-testid="add-to-cart-button"
                    >
                      Ajouter au panier
                    </GreenHighlightButton>
                  </Box>
                )}
              </CardContent>
            </CommonCard>
          </Grid>
        ))}
      </Grid>

      <Typography
        variant="h4"
        gutterBottom
        sx={{ marginTop: '2rem', color: '#2e7d32', px: 2 }}
      >
        Lots vendus
      </Typography>
      <Grid container spacing={2} sx={{ px: 2 }}>
        {soldLotsWithRemainingZero.map((lot: Lot) => (
          <Grid item xs={12} sm={6} md={4} key={lot.idLot}>
            <CommonCard
              data-testid="lot-card"
              onClick={() => handleLotClick(lot)}
            >
              <img
                src={lot.photo?.url}
                alt={lot.product.libelleProduct}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                }}
              />
              <CardContent>
                <Typography variant="h6">
                  {lot.product.libelleProduct}
                </Typography>
                <Typography>Prix : {lot.price} €</Typography>
                <Typography>Quantité vendue : {lot.soldQuantity}</Typography>
              </CardContent>
            </CommonCard>
          </Grid>
        ))}
      </Grid>

      {alertOpen && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1300,
            width: '90%',
            maxWidth: 600,
          }}
        >
          <Alert severity="success">{alertMessage}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;
