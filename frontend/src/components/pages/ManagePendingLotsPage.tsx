import { useContext, useEffect, useState } from 'react';
import { LotContext } from '../../contexts/LotContext';
import { UserContext } from '../../contexts/UserContext';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import { Lot } from '../../types';

const ManagePendingLotsPage = () => {
  const {
    pendingLots,
    fetchPendingLots,
    receiveLot,
    acceptLot,
    refuseLot,
    error,
    loading,
  } = useContext(LotContext);
  const { authenticatedUser } = useContext(UserContext);
  const [refusalReasons, setRefusalReasons] = useState<{
    [key: number]: string;
  }>({});
  const [refusingLotId, setRefusingLotId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [hasFetched, setHasFetched] = useState<boolean>(false); // Ajouté pour éviter les fetch multiples

  useEffect(() => {
    if (!hasFetched) {
      fetchPendingLots().then(() => setHasFetched(true));
    }
  }, [fetchPendingLots, hasFetched]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleAccept = async (idLot: number) => {
    const result = await acceptLot(idLot);
    if (result) {
      showSuccessMessage(`Le lot ${idLot} a été accepté avec succès !`);
      fetchPendingLots();
    }
  };

  const handleReceive = async (idLot: number) => {
    const result = await receiveLot(idLot);
    if (result) {
      showSuccessMessage(
        `Le lot ${idLot} a été réceptionné et mis en vente avec succès !`,
      );
      fetchPendingLots();
    }
  };

  const handleRefuseClick = (idLot: number) => {
    setRefusingLotId(idLot);
  };

  const handleRefuseConfirm = async (idLot: number) => {
    const reason = refusalReasons[idLot];
    if (!reason) {
      alert('Veuillez fournir une raison de refus.');
      return;
    }
    const result = await refuseLot(idLot, reason);
    if (result) {
      setRefusalReasons((prev) => {
        const newReasons = { ...prev };
        delete newReasons[idLot];
        return newReasons;
      });
      setRefusingLotId(null);
      showSuccessMessage(`Le lot ${idLot} a été refusé avec succès !`);
      fetchPendingLots();
    }
  };

  const handleReasonChange = (idLot: number, value: string) => {
    setRefusalReasons((prev) => ({ ...prev, [idLot]: value }));
  };

  const handleCancelRefuse = () => {
    setRefusingLotId(null);
    setRefusalReasons((prev) => {
      const newReasons = { ...prev };
      if (refusingLotId) {
        delete newReasons[refusingLotId];
      }
      return newReasons;
    });
  };

  if (!authenticatedUser || authenticatedUser.role !== 'GESTIONNAIRE') {
    return <Navigate to="/" />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#2e7d32', fontWeight: 'bold' }}
      >
        Gestion des lots en attente
      </Typography>

      {successMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="success">{successMessage}</Alert>
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : pendingLots.length === 0 ? (
        <Typography>Aucun lot en attente ou accepté.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Lot</TableCell>
                <TableCell>Produit</TableCell>
                <TableCell>Producteur</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Quantité Initiale</TableCell>
                <TableCell>Date Proposition</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date Réception</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingLots.map((lot: Lot) => (
                <TableRow key={lot.idLot}>
                  <TableCell>{lot.idLot}</TableCell>
                  <TableCell>{lot.product.libelleProduct}</TableCell>
                  <TableCell>{lot.producer.companyName}</TableCell>
                  <TableCell>{lot.price} €</TableCell>
                  <TableCell>{lot.initialQuantity}</TableCell>
                  <TableCell>{lot.proposalDate}</TableCell>
                  <TableCell>{lot.lotStatus}</TableCell>
                  <TableCell>{lot.receptionDate || '-'}</TableCell>
                  <TableCell>
                    {lot.lotStatus === 'en attente' ? (
                      refusingLotId === lot.idLot ? (
                        <>
                          <TextField
                            label="Raison du refus"
                            value={refusalReasons[lot.idLot!] || ''}
                            onChange={(e) =>
                              handleReasonChange(lot.idLot!, e.target.value)
                            }
                            size="small"
                            sx={{ mr: 1, width: '200px' }}
                            autoFocus
                          />
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleRefuseConfirm(lot.idLot!)}
                            sx={{ mr: 1 }}
                          >
                            Confirmer
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancelRefuse}
                          >
                            Annuler
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleAccept(lot.idLot!)}
                            sx={{ mr: 1 }}
                          >
                            Accepter
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleRefuseClick(lot.idLot!)}
                          >
                            Refuser
                          </Button>
                        </>
                      )
                    ) : lot.lotStatus === 'accepté' ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleReceive(lot.idLot!)}
                      >
                        Réceptionner
                      </Button>
                    ) : (
                      'Aucune action possible'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ManagePendingLotsPage;
