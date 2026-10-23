import { useState, SyntheticEvent, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Alert,
  useTheme,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';

// Define the LoginPage component
const LoginPage = () => {
  const { loginUser, authenticatedUser } = useContext(
    UserContext,
  ) as UserContextType;
  const navigate = useNavigate();
  const { search } = useLocation();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const theme = useTheme();

  // Check if a "success" parameter is present in the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    if (queryParams.get('success') === '1') {
      setSuccessMessage(
        'Inscription réussie, vous pouvez maintenant vous connecter !',
      );
    }
  }, [search]);

  // Redirect based on user role after login
  useEffect(() => {
    if (authenticatedUser) {
      if (authenticatedUser.role === 'PRODUCTEUR') {
        navigate('/my-lots');
      } else {
        navigate('/');
      }
    }
  }, [authenticatedUser, navigate]);

  // Handle form submission
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      newErrors.push("L'email n'est pas valide");
    }

    // Validate password
    if (password.length < 8) {
      newErrors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await loginUser({ email, password }, rememberMe);
    } catch (err) {
      console.error('LoginPage::error: ', err);
      newErrors.push('Email ou mot de passe incorrect');
      setErrors(newErrors);
    }
  };

  return (
    <Box
      sx={{
        margin: 2,
        padding: 3,
        backgroundColor: 'rgba(44, 169, 42, 0.32)',
        borderRadius: 4,
        boxShadow: 2,
      }}
    >
      <h1 style={{ color: 'rgba(23, 78, 22, 0.89)', textAlign: 'center' }}>
        Connexion
      </h1>

      {successMessage && (
        <Box sx={{ marginBottom: 2 }}>
          <Alert severity="success">
            <Typography variant="body2">{successMessage}</Typography>
          </Alert>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            color="success"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              backgroundColor: '#ffffff',
            }}
          />
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Mot de passe"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            color="success"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              backgroundColor: '#ffffff',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {errors.length > 0 && (
          <Box sx={{ marginBottom: 2 }}>
            <Alert severity="error">
              {errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  {error}
                </Typography>
              ))}
            </Alert>
          </Box>
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              sx={{
                color: 'rgb(1,1,1)',
                '&.Mui-checked': {
                  color: 'rgb(66, 121, 88)',
                },
              }}
            />
          }
          label="Se souvenir de moi"
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 2,
            justifyContent: 'flex-start',
            color: 'rgb(66, 121, 88)',
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            boxShadow: '0px 4px 10px rgba(255, 255, 255, 0.07)',
            '&:hover': {
              backgroundColor: 'rgb(27, 222, 50)',
            },
          }}
        >
          Connexion
        </Button>

        <Typography
          variant="body2"
          sx={{
            marginTop: 2,
            textAlign: 'center',
            color: 'rgba(11, 54, 19, 0.59)',
          }}
        >
          Pas encore inscrit ?{' '}
          <Link
            to="/register"
            style={{
              color: 'rgb(0, 151, 28)',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Cliquez ici
          </Link>
        </Typography>
      </form>
    </Box>
  );
};

export default LoginPage;
