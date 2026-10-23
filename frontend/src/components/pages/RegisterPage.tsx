import { useState, SyntheticEvent, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  useTheme,
  Typography,
  Grid,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Role, UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';

const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmePassword, setPasswordConfirmation] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [civility, setCivility] = useState('');

  // State for address fields
  const [street, setStreet] = useState('');
  const [postalcode, setPostalCode] = useState('');
  const [number, setNumber] = useState('');
  const [country, setCountry] = useState('Belgique');
  const [mailbox, setMailbox] = useState('');
  const [city, setCity] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // To display errors
  const [successMessage, setSuccessMessage] = useState(''); // Success message

  const theme = useTheme();

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'firstname':
        setFirstname(value);
        break;
      case 'lastname':
        setLastname(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmePassword':
        setPasswordConfirmation(value);
        break;
      case 'phonenumber':
        setPhoneNumber(value);
        break;
      case 'civility':
        setCivility(value);
        break;
      case 'street':
        setStreet(value);
        break;
      case 'postalcode':
        setPostalCode(value);
        break;
      case 'number':
        setNumber(value);
        break;
      case 'country':
        setCountry(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'mailbox':
        setMailbox(value);
        break;
      default:
        break;
    }

    // Clear the error for the field
    setErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    // Validate form fields
    if (!civility) {
      newErrors.civility = 'La civilité ne peut pas être vide';
    }
    if (!firstname) {
      newErrors.firstname = 'Le prénom ne peut pas être vide';
    }
    if (!lastname) {
      newErrors.lastname = 'Le nom ne peut pas être vide';
    }
    if (!street) {
      newErrors.street = 'La rue ne peut pas être vide';
    }
    if (!number) {
      newErrors.number = 'Le numéro ne peut pas être vide';
    }
    if (!postalcode) {
      newErrors.postalcode = 'Le code postal ne peut pas être vide';
    }
    if (!city) {
      newErrors.city = 'La ville ne peut pas être vide';
    }
    const phoneRegex = /^\+?\d{1,4}(\s?\d{2,4}){2,4}$/;
    if (!phonenumber) {
      newErrors.phonenumber = 'Le numéro de téléphone ne peut pas être vide';
    } else if (!phoneRegex.test(phonenumber)) {
      newErrors.phonenumber = "Le numéro de téléphone n'est pas valide";
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!email) {
      newErrors.email = "L'email ne peut pas être vide";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    if (!password) {
      newErrors.password = 'Le mot de passe ne peut pas être vide';
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        'Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
    }

    if (!confirmePassword) {
      newErrors.confirmePassword =
        'La confirmation du mot de passe ne peut pas être vide';
    } else if (password !== confirmePassword) {
      newErrors.confirmePassword =
        'Le mot de passe et la confirmation ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await registerUser({
        email,
        firstname,
        lastname,
        password,
        phonenumber,
        address: {
          street,
          postalcode,
          number,
          country,
          mailbox,
          city,
        },
        civility,
        role: 'CLIENT' as Role,
      });
      setSuccessMessage("L'authentification a réussi !");

      // Redirect to login page with success parameter in URL
      navigate('/login?success=1');
    } catch (err) {
      console.error('RegisterPage::error: ', err);

      if (err instanceof Error && err.message.includes('403')) {
        setErrors({
          email: 'Cet email est déjà utilisé. Veuillez en choisir un autre.',
        });
      } else {
        setErrors({ general: 'Une erreur est survenue, veuillez réessayer.' });
      }
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
        Inscription
      </h1>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Civilité"
              value={civility}
              onChange={(e) => handleInputChange('civility', e.target.value)}
              sx={{ backgroundColor: '#ffffff' }}
              color="success"
              error={!!errors.civility}
            >
              <MenuItem value="Monsieur">Monsieur</MenuItem>
              <MenuItem value="Madame">Madame</MenuItem>
            </TextField>
            {errors.civility && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.civility}
              </Typography>
            )}
          </Grid>
          {/* Left column */}
          <Grid item xs={12} sm={6}>
            {/* Firstname */}
            <TextField
              fullWidth
              id="firstname"
              name="firstname"
              label="Prénom"
              variant="outlined"
              value={firstname}
              onChange={(e) => handleInputChange('firstname', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              error={!!errors.firstname}
            />
            {errors.firstname && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.firstname}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {/* Lastname */}
            <TextField
              fullWidth
              id="lastname"
              name="lastname"
              label="Nom"
              variant="outlined"
              value={lastname}
              onChange={(e) => handleInputChange('lastname', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              error={!!errors.lastname}
            />
            {errors.lastname && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.lastname}
              </Typography>
            )}
          </Grid>

          {/* Address fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="street"
              name="street"
              label="Rue"
              variant="outlined"
              value={street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              error={!!errors.street}
            />
            {errors.street && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.street}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="number"
              name="number"
              label="Numéro"
              variant="outlined"
              value={number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              error={!!errors.number}
            />
            {errors.number && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.number}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="mailbox"
              name="mailbox"
              label="Boîte aux lettres (optionnel)"
              variant="outlined"
              value={mailbox}
              onChange={(e) => handleInputChange('mailbox', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="postalcode"
              name="postalcode"
              label="Code Postal"
              variant="outlined"
              value={postalcode}
              onChange={(e) => handleInputChange('postalcode', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              error={!!errors.postalcode}
            />
            {errors.postalcode && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.postalcode}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="country"
              name="country"
              label="Pays"
              variant="outlined"
              value={country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="city"
              name="city"
              label="Ville"
              variant="outlined"
              value={city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              error={!!errors.city}
            />
            {errors.city && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.city}
              </Typography>
            )}
          </Grid>

          {/* Phone Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="phonenumber"
              name="phonenumber"
              label="Numéro de téléphone"
              variant="outlined"
              value={phonenumber}
              onChange={(e) => handleInputChange('phonenumber', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              error={!!errors.phonenumber}
            />
            {errors.phonenumber && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.phonenumber}
              </Typography>
            )}
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              error={!!errors.email}
            />
            {errors.email && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.email}
              </Typography>
            )}
          </Grid>

          {/* Password */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Mot de passe"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
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
              error={!!errors.password}
            />
            {errors.password && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.password}
              </Typography>
            )}
          </Grid>

          {/* Confirm Password */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="confirm_password"
              name="confirm_password"
              label="Confirmer le mot de passe"
              variant="outlined"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmePassword}
              onChange={(e) =>
                handleInputChange('confirmePassword', e.target.value)
              }
              color="success"
              sx={{
                input: { color: theme.palette.secondary.contrastText },
                backgroundColor: '#ffffff',
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={!!errors.confirmePassword}
            />
            {errors.confirmePassword && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.confirmePassword}
              </Typography>
            )}
          </Grid>
        </Grid>

        {errors.general && (
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body2" color="error">
              {errors.general}
            </Typography>
          </Box>
        )}

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
            boxShadow: '0px 4px 10px rgba(255, 255, 255, 0.16)',
            '&:hover': {
              backgroundColor: 'rgb(27, 222, 50)',
            },
            marginTop: 3, // Add margin to move the button down
          }}
        >
          Créer un compte
        </Button>

        {successMessage && (
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body2" color="success">
              {successMessage}
            </Typography>
          </Box>
        )}

        <Typography
          variant="body2"
          sx={{
            marginTop: 2,
            textAlign: 'center',
            color: 'rgba(11, 54, 19, 0.59)',
          }}
        >
          Déjà un compte ?{' '}
          <Link
            to="/login"
            style={{
              color: 'rgb(0, 151, 28)', // Light green for the link
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Connectez-vous ici
          </Link>
        </Typography>
      </form>
    </Box>
  );
};

export default RegisterPage;
