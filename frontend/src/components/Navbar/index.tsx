import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';

// Structure des liens par rôle (Home → Accueil, "Ajouter un produit" retiré)
const roleNavLinks = {
  GESTIONNAIRE: [
    { label: 'Tableau de bord', path: '/dashboard' },
    { label: 'Réservations', path: '/reservations' },
    { label: 'Propositions de lots', path: '/manage-pending-lots' },
    {
      label: 'Inscrire Gestionnaire/Producteur',
      path: '/register-manager-producer',
    },
  ],
  PRODUCTEUR: [
    { label: 'Accueil', path: '/' },
    { label: 'Mes lots', path: '/my-lots' },
    { label: 'Proposer un lot', path: '/propose-lot' }, // "Ajouter un produit" retiré
  ],
  CLIENT: [
    { label: 'Mes réservations', path: '/my-reservations' },
    { label: 'Panier', path: '/cart' },
  ],
  BÉNÉVOLE: [
    { label: 'Produits', path: '/products' },
    { label: 'Réservations', path: '/reservations' },
  ],
};

const NavBar = () => {
  const { authenticatedUser, clearUser } = useContext(
    UserContext,
  ) as UserContextType;
  const navigate = useNavigate();
  const [anchorElCompte, setAnchorElCompte] = useState<null | HTMLElement>(
    null,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const handleCompteMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCompte(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElCompte(null);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'rgb(33, 69, 37)' }}>
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: { xs: '0 16px', md: '0 24px' },
          minHeight: '64px',
        }}
      >
        {/* Bouton Accueil pour les clients */}
        {authenticatedUser?.role === 'CLIENT' && (
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            Accueil
          </Button>
        )}

        {/* Liens spécifiques au rôle (affichés directement) */}
        {authenticatedUser && roleNavLinks[authenticatedUser.role] && (
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            {roleNavLinks[authenticatedUser.role].map((link) => (
              <Button
                key={link.label}
                color="inherit"
                onClick={() => navigate(link.path)}
                sx={{
                  fontWeight: 'medium',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Section droite : Bienvenue + Compte */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {authenticatedUser ? (
            <>
              <Typography
                sx={{
                  display: { xs: 'none', md: 'block' },
                  fontWeight: 'medium',
                  fontSize: '1rem',
                }}
              >
                Bienvenue {authenticatedUser.firstname}{' '}
                {authenticatedUser.lastname} !
              </Typography>
              <Button
                color="inherit"
                onClick={handleCompteMenuOpen}
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                  textTransform: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Compte
              </Button>
              <Menu
                anchorEl={anchorElCompte}
                open={Boolean(anchorElCompte)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: 'rgb(33, 69, 37)',
                    color: '#ffffff',
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    navigate('/account');
                    handleMenuClose();
                  }}
                  sx={{
                    fontSize: '0.9rem',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  Voir mon profil
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleLogout();
                    handleMenuClose();
                  }}
                  sx={{
                    fontSize: '0.9rem',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  Déconnexion
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                  textTransform: 'none',
                  fontSize: '0.9rem',
                }}
              >
                S'inscrire
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                  textTransform: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Se connecter
              </Button>
            </>
          )}

          {/* Bouton menu burger pour mobile */}
          {authenticatedUser && (
            <IconButton
              color="inherit"
              onClick={toggleMobileMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Menu mobile */}
      {authenticatedUser && mobileOpen && (
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            backgroundColor: 'rgb(33, 69, 37)',
            padding: 2,
          }}
        >
          {roleNavLinks[authenticatedUser.role].map((link) => (
            <Button
              key={link.label}
              color="inherit"
              onClick={() => {
                navigate(link.path);
                setMobileOpen(false);
              }}
              sx={{
                fontWeight: 'medium',
                textTransform: 'none',
                fontSize: '1rem',
                justifyContent: 'flex-start',
                padding: '10px 16px',
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
      )}
    </AppBar>
  );
};

export default NavBar;
