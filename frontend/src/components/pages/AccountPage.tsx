import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';

const formatCreationDate = (dateString: string | undefined) => {
  if (!dateString) return 'Non renseignée';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `Crée le ${day}/${month}/${year}`;
};

const AccountPage = () => {
  const { authenticatedUser, updateUser } =
    useContext<UserContextType>(UserContext);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEditPassword = () => {
    setIsEditingPassword(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  const handleConfirmPasswordChange = async () => {
    // Validation du nouveau mot de passe
    if (!newPassword) {
      setError('Le nouveau mot de passe ne peut pas être vide');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        'Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
      );
      return;
    }

    // Validation de la confirmation
    if (!confirmPassword) {
      setError('La confirmation du mot de passe ne peut pas être vide');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Le mot de passe et la confirmation ne correspondent pas');
      return;
    }

    // Validation de l'ancien mot de passe
    if (!oldPassword) {
      setError("L'ancien mot de passe ne peut pas être vide");
      return;
    }

    if (authenticatedUser) {
      try {
        console.log('Token envoyé :', authenticatedUser.token);
        const response = await fetch('/api/auths/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authenticatedUser.token}`,
          },
          body: JSON.stringify({
            oldPassword: oldPassword,
            password: newPassword,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Réponse serveur :', response.status, errorText);
          let errorMessage = `Erreur ${response.status}: ${errorText}`;
          if (
            response.status === 400 &&
            errorText.includes('Incorrect old password')
          ) {
            errorMessage = "L'ancien mot de passe est incorrect";
          } else if (
            response.status === 400 &&
            errorText.includes('New password cannot be the same')
          ) {
            errorMessage =
              "Le nouveau mot de passe ne peut pas être identique à l'ancien";
          } else if (response.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          }
          throw new Error(errorMessage);
        }

        const updatedUser = await response.json();
        if (updateUser) {
          await updateUser(updatedUser);
          setSuccess('Mot de passe mis à jour avec succès !');
        }
        setIsEditingPassword(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
      } catch (error) {
        console.error('Erreur complète lors de la mise à jour :', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Une erreur est survenue lors de la mise à jour',
        );
      }
    } else {
      setError('Utilisateur non authentifié. Veuillez vous reconnecter.');
    }
  };

  return (
    <Box sx={{ padding: 4, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        Mon profil
      </Typography>

      {authenticatedUser ? (
        <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
          <TableContainer
            component={Paper}
            sx={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}
          >
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.firstname}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.lastname}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.address?.street || 'Non renseignée'}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.address?.number || 'Non renseigné'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.address?.mailbox || 'Non renseignée'}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.address?.postalcode || 'Non renseigné'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.address?.city || 'Non renseignée'}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.address?.country || 'Non renseigné'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.phonenumber}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {authenticatedUser.email}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {isEditingPassword ? (
                      <>
                        <TextField
                          label="Ancien mot de passe"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          size="small"
                          type={showOldPassword ? 'text' : 'password'}
                          fullWidth
                          color="success"
                          sx={{ backgroundColor: '#ffffff', mb: 2 }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={
                                    showOldPassword
                                      ? 'Hide old password'
                                      : 'Show old password'
                                  }
                                  onClick={() =>
                                    setShowOldPassword(!showOldPassword)
                                  }
                                  edge="end"
                                >
                                  {showOldPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          label="Nouveau mot de passe"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          size="small"
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          color="success"
                          sx={{ backgroundColor: '#ffffff', mb: 2 }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={
                                    showPassword
                                      ? 'Hide new password'
                                      : 'Show new password'
                                  }
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          label="Confirmer le mot de passe"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          size="small"
                          type={showConfirmPassword ? 'text' : 'password'}
                          fullWidth
                          color="success"
                          sx={{ backgroundColor: '#ffffff' }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={
                                    showConfirmPassword
                                      ? 'Hide confirm password'
                                      : 'Show confirm password'
                                  }
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  edge="end"
                                >
                                  {showConfirmPassword ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </>
                    ) : (
                      'Mot de passe : ****'
                    )}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #ddd' }}>
                    {formatCreationDate(authenticatedUser.creationDate)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" sx={{ mt: 2 }}>
              {success}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
            <Button
              variant="contained"
              onClick={
                isEditingPassword
                  ? handleConfirmPasswordChange
                  : handleEditPassword
              }
              sx={{
                backgroundColor: '#2e7d32',
                color: 'white',
                '&:hover': { backgroundColor: '#1b5e20' },
              }}
            >
              {isEditingPassword ? 'Confirmer' : 'Modifier'}
            </Button>
            {isEditingPassword && (
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                sx={{
                  borderColor: '#2e7d32',
                  color: '#2e7d32',
                  '&:hover': { borderColor: '#1b5e20', color: '#1b5e20' },
                }}
              >
                Annuler
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ marginTop: 4 }}>
          Aucune information utilisateur disponible.
        </Typography>
      )}
    </Box>
  );
};

export default AccountPage;
