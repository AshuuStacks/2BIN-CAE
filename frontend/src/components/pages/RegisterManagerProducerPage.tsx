import { useState, SyntheticEvent, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Grid,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { NewManagerProducer, UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';

const RegisterManagerProducerPage = () => {
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmePassword, setPasswordConfirmation] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [civility, setCivility] = useState('');
  const [role, setRole] = useState('');
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [street, setStreet] = useState('');
  const [postalcode, setPostalCode] = useState('');
  const [number, setNumber] = useState('');
  const [country, setCountry] = useState('Belgique');
  const [mailbox, setMailbox] = useState('');
  const [city, setCity] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authenticatedUser === undefined) {
      return;
    }
    setIsLoading(false);
    if (!authenticatedUser) {
      navigate('/login');
    } else if (authenticatedUser.role !== 'GESTIONNAIRE') {
      navigate('/');
    }
  }, [authenticatedUser, navigate]);

  const handleInputChange = (field: string, value: string) => {
    const setters: { [key: string]: (value: string) => void } = {
      email: setEmail,
      firstname: setFirstname,
      lastname: setLastname,
      password: setPassword,
      confirmePassword: setPasswordConfirmation,
      phonenumber: setPhoneNumber,
      civility: setCivility,
      role: setRole,
      nomEntreprise: setNomEntreprise,
      street: setStreet,
      postalcode: setPostalCode,
      number: setNumber,
      country: setCountry,
      city: setCity,
      mailbox: setMailbox,
    };

    if (setters[field]) {
      setters[field](value);
      setErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!civility) newErrors.civility = 'La civilité ne peut pas être vide';
    if (!firstname) newErrors.firstname = 'Le prénom ne peut pas être vide';
    if (!lastname) newErrors.lastname = 'Le nom ne peut pas être vide';
    if (!street) newErrors.street = 'La rue ne peut pas être vide';
    if (!number) newErrors.number = 'Le numéro ne peut pas être vide';
    if (!postalcode)
      newErrors.postalcode = 'Le code postal ne peut pas être vide';
    if (!city) newErrors.city = 'La ville ne peut pas être vide';
    if (!phonenumber)
      newErrors.phonenumber = 'Le numéro de téléphone ne peut pas être vide';
    else if (!/^\+?\d{1,4}(\s?\d{2,4}){2,4}$/.test(phonenumber))
      newErrors.phonenumber = "Le numéro de téléphone n'est pas valide";

    if (
      !email ||
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)
    ) {
      newErrors.email = !email
        ? "L'email ne peut pas être vide"
        : "L'email n'est pas valide";
    }

    if (
      !password ||
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password)
    ) {
      newErrors.password = !password
        ? 'Le mot de passe ne peut pas être vide'
        : 'Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
    }

    if (!confirmePassword || password !== confirmePassword) {
      newErrors.confirmePassword = !confirmePassword
        ? 'La confirmation du mot de passe ne peut pas être vide'
        : 'Le mot de passe et la confirmation ne correspondent pas';
    }

    if (!role || !['GESTIONNAIRE', 'PRODUCTEUR'].includes(role)) {
      newErrors.role = 'Vous devez choisir un rôle valide';
    }

    if (role === 'PRODUCTEUR' && !nomEntreprise) {
      newErrors.nomEntreprise =
        "Le nom de l'entreprise ne peut pas être vide pour un producteur";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newUser: NewManagerProducer = {
      email,
      firstname,
      lastname,
      password,
      phonenumber,
      address: { street, postalcode, number, country, mailbox, city },
      civility,
      role: role as 'GESTIONNAIRE' | 'PRODUCTEUR',
      nomEntreprise: role === 'PRODUCTEUR' ? nomEntreprise : undefined,
    };

    try {
      const token = authenticatedUser?.token;
      const response = await fetch('/api/auths/register-manager-producer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      await response.json();
      setSuccessMessage('Utilisateur créé avec succès !');
      navigate('/');
    } catch (err) {
      console.error('Erreur lors de l’inscription:', err);
      setErrors({ general: (err as Error).message });
      if (err instanceof Error && err.message.includes('403')) {
        setErrors({
          email: 'Cet email est déjà utilisé. Veuillez en choisir un autre.',
        });
      }
    }
  };

  if (isLoading) {
    return <Typography>Chargement...</Typography>;
  }

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
        Inscription Gestionnaire/Producteur
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Prénom"
              value={firstname}
              onChange={(e) => handleInputChange('firstname', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
              error={!!errors.firstname}
            />
            {errors.firstname && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.firstname}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nom"
              value={lastname}
              onChange={(e) => handleInputChange('lastname', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
              error={!!errors.lastname}
            />
            {errors.lastname && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.lastname}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Rue"
              value={street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
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
              label="Numéro"
              value={number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
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
              label="Boîte aux lettres (optionnel)"
              value={mailbox}
              onChange={(e) => handleInputChange('mailbox', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Code Postal"
              value={postalcode}
              onChange={(e) => handleInputChange('postalcode', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
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
              label="Pays"
              value={country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ville"
              value={city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
              error={!!errors.city}
            />
            {errors.city && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.city}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Numéro de téléphone"
              value={phonenumber}
              onChange={(e) => handleInputChange('phonenumber', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
              error={!!errors.phonenumber}
            />
            {errors.phonenumber && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.phonenumber}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
              error={!!errors.email}
            />
            {errors.email && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.email}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmePassword}
              onChange={(e) =>
                handleInputChange('confirmePassword', e.target.value)
              }
              color="success"
              sx={{ backgroundColor: '#ffffff' }}
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Rôle"
              value={role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              sx={{ backgroundColor: '#ffffff' }}
              color="success"
              error={!!errors.role}
            >
              <MenuItem value="GESTIONNAIRE">Gestionnaire</MenuItem>
              <MenuItem value="PRODUCTEUR">Producteur</MenuItem>
            </TextField>
            {errors.role && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {errors.role}
              </Typography>
            )}
          </Grid>

          {role === 'PRODUCTEUR' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'entreprise"
                value={nomEntreprise}
                onChange={(e) =>
                  handleInputChange('nomEntreprise', e.target.value)
                }
                color="success"
                sx={{ backgroundColor: '#ffffff' }}
                error={!!errors.nomEntreprise}
              />
              {errors.nomEntreprise && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {errors.nomEntreprise}
                </Typography>
              )}
            </Grid>
          )}
        </Grid>

        {errors.general && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {errors.general}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          sx={{ mt: 3 }}
        >
          Créer un compte
        </Button>

        {successMessage && (
          <Typography variant="body2" color="success" sx={{ mt: 2 }}>
            {successMessage}
          </Typography>
        )}
      </form>
    </Box>
  );
};

export default RegisterManagerProducerPage;
