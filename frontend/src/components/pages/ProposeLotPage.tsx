import { useState, useContext, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Alert,
  Autocomplete,
  FormControlLabel,
  Radio,
  RadioGroup,
  Fade,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dayjs } from 'dayjs';
import { ProductContext } from '../../contexts/ProductContext';
import { LotContextType, Product, UserContextType } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { LotContext } from '../../contexts/LotContext';
import dayjs from 'dayjs';

interface PhotoOption {
  idPhoto: number;
  url: string;
}

const ProposerLotPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [availabilityDate, setAvailabilityDate] = useState<Dayjs | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<PhotoOption[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoOption | null>(null);
  const [photoOption, setPhotoOption] = useState<'upload' | 'existing'>(
    'upload',
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const productContext = useContext(ProductContext);
  const { successMessage, setSuccessMessage } = useContext(ProductContext);
  const { authenticatedUser } = useContext(UserContext) as UserContextType;
  const { refetchLots } = useContext(LotContext) as LotContextType;

  // Minimum date: 3 days from today
  const minAvailabilityDate = dayjs().add(3, 'day');

  // Charger les produits et vérifier l'authentification
  useEffect(() => {
    if (!authenticatedUser) {
      setErrors({ general: 'Vous devez être connecté pour proposer un lot.' });
      navigate('/login');
      return;
    }
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const fetchedProducts = await productContext.fetchProducts();
        if (fetchedProducts.length === 0) {
          setErrors({
            general: 'Aucun produit disponible. Veuillez ajouter un produit.',
          });
        }
        setProducts(fetchedProducts);
      } catch (error) {
        setErrors({ general: 'Erreur lors du chargement des produits.' });
        console.error('Erreur lors du chargement des produits:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [productContext, authenticatedUser, navigate]);

  // Charger les photos existantes lorsque le produit change
  useEffect(() => {
    const loadExistingPhotos = async () => {
      if (!selectedProduct || !authenticatedUser?.token) {
        setExistingPhotos([]);
        setSelectedPhoto(null);
        return;
      }
      setIsLoading(true);
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authenticatedUser.token}`,
        };
        const response = await fetch(`/api/lots/photos/${selectedProduct.id}`, {
          method: 'GET',
          headers,
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erreur lors du chargement des photos: ${response.status} - ${errorText}`,
          );
        }
        const photos: PhotoOption[] = await response.json();
        setExistingPhotos(photos);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Erreur lors du chargement des photos.';
        setErrors((prev) => ({ ...prev, photos: errorMessage }));
        setExistingPhotos([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadExistingPhotos();
  }, [selectedProduct, authenticatedUser]);

  // Nettoyage de l'URL de l'image pour éviter les fuites de mémoire
  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handlePhotoOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoOption(e.target.value as 'upload' | 'existing');
    setImage(null);
    setSelectedPhoto(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: { [key: string]: string } = {};

    if (!selectedProduct)
      newErrors.product = 'Un produit doit être sélectionné';
    if (!selectedProduct?.productType)
      newErrors.productType = 'Le type de produit est requis';
    if (!quantity) newErrors.quantity = 'La quantité est requise';
    else if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0)
      newErrors.quantity = 'La quantité doit être un nombre positif';
    if (!price) newErrors.price = 'Le prix est requis';
    else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      newErrors.price = 'Le prix doit être un nombre positif';
    if (!availabilityDate)
      newErrors.availabilityDate = 'La date de disponibilité est requise';
    else if (availabilityDate.isBefore(minAvailabilityDate, 'day'))
      newErrors.availabilityDate =
        'La date de disponibilité doit être au moins 3 jours après aujourd’hui';
    if (photoOption === 'upload' && !image)
      newErrors.image = 'Une image est requise';
    if (photoOption === 'existing' && !selectedPhoto)
      newErrors.image = 'Une photo existante doit être sélectionnée';
    if (!authenticatedUser)
      newErrors.general = 'Vous devez être connecté pour proposer un lot';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.general) navigate('/login');
      return;
    }

    const lotData = {
      idLot: null,
      price: parseFloat(price),
      initialQuantity: parseFloat(quantity),
      soldQuantity: 0,
      reservedQuantity: 0,
      remainingQuantity: parseFloat(quantity),
      withdrawnQuantity: 0,
      lotStatus: 'en attente',
      availableDate: availabilityDate
        ? availabilityDate.format('YYYY-MM-DD')
        : null,
      proposalDate: new Date().toISOString().split('T')[0],
      receptionDate: null,
      productId: selectedProduct?.id,
      producerId: authenticatedUser?.id,
      photoId: photoOption === 'existing' ? selectedPhoto?.idPhoto : null,
      responsible: null,
    };

    const formData = new FormData();
    formData.append(
      'newLot',
      new Blob([JSON.stringify(lotData)], { type: 'application/json' }),
    );
    if (photoOption === 'upload' && image) formData.append('image', image);

    setIsLoading(true);
    try {
      const token = authenticatedUser?.token;
      if (!token) throw new Error('Token manquant');
      const response = await fetch('/api/lots/add', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de la proposition du lot: ${errorText}`);
      }
      refetchLots();
      setSuccessMessage('Le lot a été proposé avec succès !');
      navigate('/my-lots');
    } catch (err) {
      setErrors({
        general:
          err instanceof Error ? err.message : 'Une erreur est survenue.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

  // Regrouper les erreurs en un seul message
  const errorMessage = Object.values(errors).filter(Boolean).join(' | ');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Messages de succès et d'erreur */}
      {successMessage && (
        <Box sx={{ mb: 1, maxWidth: 700, mx: 'auto' }}>
          <Alert severity="success">{successMessage}</Alert>
        </Box>
      )}
      {errorMessage && (
        <Box sx={{ mb: 1, maxWidth: 700, mx: 'auto' }}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}
      {isLoading && (
        <Box sx={{ textAlign: 'center', my: 1 }}>
          <CircularProgress color="success" size={20} />
        </Box>
      )}

      {/* Conteneur principal */}
      <Box
        sx={{
          maxWidth: 700,
          mx: 'auto',
          my: 2,
          p: 2,
          bgcolor: '#e8f5e9',
          borderRadius: 2,
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ color: '#4caf50', mb: 2, fontWeight: 'medium' }}
        >
          Proposer un nouveau lot
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={1.5}>
            {/* Section : Produit */}
            <Grid item xs={12}>
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  p: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography variant="body2" sx={{ color: '#4caf50', mb: 1 }}>
                  Produit
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <Autocomplete
                      fullWidth
                      options={products}
                      getOptionLabel={(option) => option.libelleProduct}
                      value={selectedProduct}
                      onChange={(_event, newValue) =>
                        setSelectedProduct(newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Nom du produit"
                          placeholder="Sélectionnez un produit"
                          color="success"
                          size="small"
                          sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Type de produit"
                      value={
                        selectedProduct?.productType?.libelleType ||
                        'Non défini'
                      }
                      InputProps={{ readOnly: true }}
                      color="success"
                      size="small"
                      sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Unité"
                      value={selectedProduct?.unite?.unite || 'Non défini'}
                      InputProps={{ readOnly: true }}
                      color="success"
                      size="small"
                      sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={selectedProduct?.description || 'Non défini'}
                      InputProps={{ readOnly: true }}
                      color="success"
                      size="small"
                      sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Section : Détails du lot */}
            <Grid item xs={12}>
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  p: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography variant="body2" sx={{ color: '#4caf50', mb: 1 }}>
                  Détails du lot
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Quantité initiale"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Ex: 10"
                      color="success"
                      size="small"
                      sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prix par unité (€)"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: 5.00"
                      color="success"
                      size="small"
                      sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DatePicker
                      label="Date de disponibilité"
                      value={availabilityDate}
                      onChange={(newValue: Dayjs | null) =>
                        setAvailabilityDate(newValue)
                      }
                      minDate={minAvailabilityDate}
                      slots={{ openPickerIcon: CalendarTodayIcon }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          color: 'success',
                          size: 'small',
                          helperText: 'Minimum 3 jours à partir d’aujourd’hui',
                          sx: {
                            bgcolor: '#f5f5f5',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#4caf50' },
                              '&:hover fieldset': { borderColor: '#388e3c' },
                              '&.Mui-focused fieldset': {
                                borderColor: '#388e3c',
                              },
                            },
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Section : Photo du lot */}
            <Grid item xs={12}>
              <Box
                sx={{
                  bgcolor: '#e8f5e9',
                  p: 0.5,
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography variant="body2" sx={{ color: '#4caf50', mb: 1 }}>
                  Photo du lot
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <RadioGroup
                      value={photoOption}
                      onChange={handlePhotoOptionChange}
                      sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <FormControlLabel
                        value="upload"
                        control={<Radio color="success" size="small" />}
                        label="Uploader une nouvelle image"
                      />
                      <FormControlLabel
                        value="existing"
                        control={<Radio color="success" size="small" />}
                        label="Choisir une image existante"
                      />
                    </RadioGroup>
                  </Grid>
                  {photoOption === 'upload' && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 1.5 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: '#4caf50', mb: 0.5 }}
                        >
                          Image du lot
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="image-upload"
                          />
                          <Button
                            variant="outlined"
                            color="success"
                            component="label"
                            htmlFor="image-upload"
                            size="small"
                            sx={{
                              borderRadius: '6px',
                              textTransform: 'none',
                              bgcolor: '#f5f5f5',
                              '&:hover': { bgcolor: '#e8f5e9' },
                            }}
                          >
                            Choisir une image
                          </Button>
                          <Typography
                            variant="caption"
                            sx={{ color: image ? '#4caf50' : '#888', mt: 0.5 }}
                          >
                            {image ? image.name : 'Aucune image sélectionnée'}
                          </Typography>
                        </Box>
                      </Box>
                      {image && (
                        <Fade in={!!image} timeout={300}>
                          <Box
                            sx={{
                              mt: 1.5,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {image instanceof File ? (
                              <Box
                                component="img"
                                src={URL.createObjectURL(image)}
                                alt="Aperçu de l'image"
                                sx={{
                                  width: { xs: '140px', sm: '300px' },
                                  height: { xs: '140px', sm: '300px' },
                                  borderRadius: '8px',
                                  border: 'none',
                                  outline: 'none',
                                  backgroundColor: 'transparent',
                                  objectFit: 'cover',
                                  objectPosition: 'center',
                                  display: 'block',
                                  m: 0,
                                  p: 0,
                                }}
                              />
                            ) : (
                              <Typography variant="caption" color="error">
                                Image invalide
                              </Typography>
                            )}
                            <IconButton
                              color="error"
                              onClick={() => setImage(null)}
                              sx={{
                                mt: 0.5,
                                bgcolor: 'rgba(211, 47, 47, 0.08)',
                                '&:hover': {
                                  bgcolor: 'rgba(211, 47, 47, 0.15)',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Fade>
                      )}
                    </Grid>
                  )}
                  {photoOption === 'existing' && (
                    <Grid item xs={12}>
                      <Autocomplete
                        fullWidth
                        options={existingPhotos}
                        getOptionLabel={(option) => `Photo ${option.idPhoto}`}
                        value={selectedPhoto}
                        onChange={(_event, newValue) =>
                          setSelectedPhoto(newValue)
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option.idPhoto}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                component="img"
                                src={option.url}
                                alt={`Photo ${option.idPhoto}`}
                                sx={{
                                  width: '32px',
                                  height: '32px',
                                  mr: 1,
                                  borderRadius: '4px',
                                  border: '1px solid #4caf50',
                                  objectFit: 'cover',
                                }}
                              />
                              <Typography variant="body2">{`Photo ${option.idPhoto}`}</Typography>
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Choisir une photo existante"
                            placeholder="Sélectionnez une photo"
                            color="success"
                            size="small"
                            sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}
                          />
                        )}
                      />
                      {selectedPhoto && selectedPhoto.url && (
                        <Fade in={!!selectedPhoto} timeout={300}>
                          <Box
                            sx={{
                              mt: 1.5,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Box
                              component="img"
                              src={selectedPhoto.url}
                              alt={`Aperçu de la photo ${selectedPhoto.idPhoto}`}
                              sx={{
                                width: { xs: '140px', sm: '300px' },
                                height: { xs: '140px', sm: '300px' },
                                borderRadius: '8px',
                                border: 'none',
                                outline: 'none',
                                backgroundColor: 'transparent',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                display: 'block',
                                m: 0,
                                p: 0,
                              }}
                              onError={() =>
                                setErrors({
                                  image: "Erreur de chargement de l'image",
                                })
                              }
                            />
                            <IconButton
                              color="error"
                              onClick={() => setSelectedPhoto(null)}
                              sx={{
                                mt: 0.5,
                                bgcolor: 'rgba(211, 47, 47, 0.08)',
                                '&:hover': {
                                  bgcolor: 'rgba(211, 47, 47, 0.15)',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Fade>
                      )}
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Bouton de soumission */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                disabled={isLoading}
                sx={{
                  mt: 2,
                  py: 1,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 'medium',
                  bgcolor: '#4caf50',
                  '&:hover': {
                    bgcolor: '#388e3c',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
                  },
                  '&:disabled': { bgcolor: '#a5d6a7' },
                }}
              >
                Proposer le lot
              </Button>
            </Grid>

            {/* Lien pour ajouter un produit */}
            <Grid item xs={12}>
              <Typography
                variant="caption"
                sx={{ mt: 1, textAlign: 'center', color: '#4caf50' }}
              >
                Produit manquant ?{' '}
                <Link
                  to="/addProduct"
                  style={{
                    color: '#388e3c',
                    textDecoration: 'none',
                    fontWeight: 'medium',
                  }}
                >
                  Ajoutez-le ici
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default ProposerLotPage;
