import { useState, useContext } from 'react';
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import { ProductContext } from '../../contexts/ProductContext';
import { Unite, ProductType } from '../../types';
import { useNavigate } from 'react-router-dom';

const AddProductPage = () => {
  const [libelleProduct, setProductName] = useState('');
  const [unite, setUnite] = useState<Unite | null>(null);
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { addProduct, setSuccessMessage } = useContext(ProductContext);
  const navigate = useNavigate();

  const productTypes: ProductType[] = [
    { id: 1, libelleType: 'Légumes' },
    { id: 2, libelleType: 'Fruits' },
    { id: 3, libelleType: 'Produits laitiers' },
    { id: 4, libelleType: 'Boulangerie' },
    { id: 5, libelleType: 'Viande' },
    { id: 6, libelleType: 'Boissons' },
    { id: 7, libelleType: 'Autres' },
  ];

  const units: Unite[] = [
    { id: 1, unite: 'Kg' },
    { id: 2, unite: 'Litre' },
    { id: 3, unite: 'Pièce' },
    { id: 6, unite: 'Bouteille' },
    { id: 7, unite: 'Paquet' },
    { id: 8, unite: 'Autre' },
  ];

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!libelleProduct || !unite || !productType) {
      setErrorMessage('Tous les champs doivent être remplis !');
      return;
    }

    const newProduct = {
      libelleProduct,
      unite: { unite: unite.unite },
      productType: { libelleType: productType.libelleType },
      description,
    };

    try {
      console.log('Envoi du produit :', newProduct);
      await addProduct(newProduct);
      setSuccessMessage('Le produit a été ajouté avec succès !');
      navigate('/propose-lot');
    } catch (err) {
      if (err instanceof Error && err.message.includes('409')) {
        setErrorMessage(
          'Ce produit existe déjà. Veuillez en ajouter un autre.',
        );
      } else {
        setErrorMessage('Une erreur est survenue, veuillez réessayer.');
      }
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        p: 4,
        bgcolor: 'rgba(44, 169, 42, 0.32)',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ color: '#2e7d32', fontWeight: 'bold' }}
      >
        Ajouter un produit
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Nom du produit"
            fullWidth
            value={libelleProduct}
            onChange={(e) => setProductName(e.target.value)}
            InputProps={{ sx: { color: 'black' } }} // Couleur du texte
            InputLabelProps={{ sx: { color: 'black' } }}
            required
            sx={{
              bgcolor: 'white',
              '& .MuiInputLabel-root': {
                color: 'black', // Couleur du label par défaut
                '&.Mui-focused': { color: 'black' }, // Couleur du label lorsqu'il est focusé
                '&.Mui-error': { color: 'black' }, // Couleur du label en cas d'erreur
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#66bb6a' }, // Couleur de la bordure par défaut
                '&:hover fieldset': { borderColor: '#2e7d32' }, // Couleur de la bordure au survol
                '&.Mui-focused fieldset': { borderColor: '#2e7d32' }, // Couleur de la bordure lorsqu'il est focusé
                '&.Mui-error fieldset': { borderColor: '#f44336' }, // Couleur de la bordure en cas d'erreur
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Type de produit"
            value={productType ? productType.libelleType : ''}
            onChange={(e) =>
              setProductType(
                productTypes.find(
                  (type) => type.libelleType === e.target.value,
                ) || null,
              )
            }
            required
            sx={{
              bgcolor: 'white',
              '& .MuiInputLabel-root': {
                color: 'black', // Couleur du label par défaut
                '&.Mui-focused': { color: 'black' }, // Couleur du label lorsqu'il est focusé
                '&.Mui-error': { color: 'black' }, // Couleur du label en cas d'erreur
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#66bb6a' }, // Couleur de la bordure par défaut
                '&:hover fieldset': { borderColor: '#2e7d32' }, // Couleur de la bordure au survol
                '&.Mui-focused fieldset': { borderColor: '#2e7d32' }, // Couleur de la bordure lorsqu'il est focusé
                '&.Mui-error fieldset': { borderColor: '#f44336' }, // Couleur de la bordure en cas d'erreur
              },
            }}
          >
            <MenuItem value="">Sélectionner</MenuItem>
            {productTypes.map((type) => (
              <MenuItem key={type.id} value={type.libelleType}>
                {type.libelleType}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Unité choisie"
            value={unite ? unite.unite : ''}
            onChange={(e) =>
              setUnite(
                units.find((unit) => unit.unite === e.target.value) || null,
              )
            }
            required
            sx={{
              bgcolor: 'white',
              '& .MuiInputLabel-root': {
                color: 'black', // Couleur du label par défaut
                '&.Mui-focused': { color: 'black' }, // Couleur du label lorsqu'il est focusé
                '&.Mui-error': { color: 'black' }, // Couleur du label en cas d'erreur
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#66bb6a' }, // Couleur de la bordure par défaut
                '&:hover fieldset': { borderColor: '#2e7d32' }, // Couleur de la bordure au survol
                '&.Mui-focused fieldset': { borderColor: '#2e7d32' }, // Couleur de la bordure lorsqu'il est focusé
                '&.Mui-error fieldset': { borderColor: '#f44336' }, // Couleur de la bordure en cas d'erreur
              },
            }}
          >
            <MenuItem value="">Sélectionner</MenuItem>
            {units.map((unitOption) => (
              <MenuItem key={unitOption.id} value={unitOption.unite}>
                {unitOption.unite}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Description (120 caractères)"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{
              bgcolor: 'white',
              '& .MuiInputLabel-root': {
                color: 'black', // Couleur du label par défaut
                '&.Mui-focused': { color: 'black' }, // Couleur du label lorsqu'il est focusé
                '&.Mui-error': { color: 'black' }, // Couleur du label en cas d'erreur
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#66bb6a' }, // Couleur de la bordure par défaut
                '&:hover fieldset': { borderColor: '#2e7d32' }, // Couleur de la bordure au survol
                '&.Mui-focused fieldset': { borderColor: '#2e7d32' }, // Couleur de la bordure lorsqu'il est focusé
                '&.Mui-error fieldset': { borderColor: '#f44336' }, // Couleur de la bordure en cas d'erreur
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="button"
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              bgcolor: '#2e7d32',
              color: 'white',
              mt: 2,
              py: 1.5,
              '&:hover': { bgcolor: '#1b5e20' },
            }}
          >
            Ajouter le produit
          </Button>
          {errorMessage && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error">{errorMessage}</Alert>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddProductPage;
