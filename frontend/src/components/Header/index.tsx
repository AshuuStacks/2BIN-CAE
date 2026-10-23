import { Box, Container, Typography, useTheme } from '@mui/material';
import logo from '../../assets/images/logoGreenbox.png';

// Define the props for the Header component
interface HeaderProps {
  title: string;
  version: number;
  handleHeaderClick: () => void;
}

// Define the Header component
const Header = ({ title }: HeaderProps) => {
  // Get the theme from MUI
  const theme = useTheme();
  title =
    'Coopérative de Produits Locaux - Réservez et Achetez des Produits Frais ! ';

  // Render the component
  return (
    <Box
      component="header"
      sx={{
        px: 2,
        display: 'flex', // Use flexbox to align items
        alignItems: 'center', // Center items vertically
        backgroundColor: 'rgb(41, 86, 55)', // Green background color
        color: theme.palette.success.contrastText, // Contrasting text color
      }}
    >
      {/* Logo on the left with increased size */}
      <Box sx={{ display: 'inline-block', mr: 2 }}>
        <img src={logo} alt="Logo" width={100} />
      </Box>

      <Container maxWidth="sm">
        <Typography
          variant="h6" // Change variant for a smaller title (e.g., h6)
          sx={{ fontSize: '1.5rem' }} // Reduce text size if necessary
        >
          {`${title} `}
        </Typography>
      </Container>
    </Box>
  );
};

// Export the Header component as the default export
export default Header;
