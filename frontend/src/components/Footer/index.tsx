import { Box, Container, Typography, useTheme } from '@mui/material';
import { Copyright } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        backgroundColor: 'rgb(41, 86, 55)', // dark green
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'inline-block',
            paddingRight: 2,
            color: theme.palette.secondary.contrastText,
          }}
        >
          <Typography variant="body1" color="white">
            <Typography>
              Terroir & Cie - Rue du Bon Terroir, 7, 6980 Valtontaine, Belgique
            </Typography>
            <Typography>
              Téléphone : +32 84 987 654 - Email : contact@terroiretcie.be
            </Typography>
            <Typography>
              Heures d'ouverture : Mardi 16h-20h | Jeudi 18h-21h
            </Typography>
          </Typography>
          <Typography color="white" display="flex" justifyContent="center">
            <Copyright data-testid="copyright-icon" />
            GreenBox
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
