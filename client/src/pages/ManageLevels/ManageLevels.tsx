import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import LevelForm from '../../components/LevelForm/LevelForm';

interface Level {
  id?: number;
  name?: string;
  code?: string;
  level_number?: number;
  description?: string;
}

const levelNames: { [key: number]: string } = {
  1: 'Site-uri',
  2: 'Entități',
  3: 'Unități',
  4: 'Ansambluri funcționale',
  5: 'Locații funcționale',
};

const ManageLevels: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingLevelId, setDeletingLevelId] = useState<number | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/levels');
      setLevels(response.data.data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'A apărut o eroare la preluarea nivelelor.';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const handleOpenForm = (level: Level | null = null, levelNumber?: number) => {
    if (level) {
      setEditingLevel(level);
    } else {
      setEditingLevel({ level_number: levelNumber });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLevel(null);
  };

  const handleSaveLevel = async (data: Level) => {
    try {
      if (editingLevel && editingLevel.id) {
        await axios.put(`http://localhost:3001/api/levels/${editingLevel.id}`, data);
        enqueueSnackbar('Nivelul a fost actualizat cu succes!', { variant: 'success' });
      } else {
        await axios.post('http://localhost:3001/api/levels', data);
        enqueueSnackbar('Nivelul a fost adăugat cu succes!', { variant: 'success' });
      }
      handleCloseForm();
      fetchLevels();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'A apărut o eroare la salvarea nivelului.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingLevelId(id);
    setConfirmDeleteOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setDeletingLevelId(null);
    setConfirmDeleteOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLevelId) return;
    try {
      await axios.delete(`http://localhost:3001/api/levels/${deletingLevelId}`);
      enqueueSnackbar('Nivelul a fost șters cu succes!', { variant: 'success' });
      fetchLevels();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'A apărut o eroare la ștergerea nivelului.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      handleCloseConfirmDelete();
    }
  };

  const renderLevelCard = (levelNumber: number) => {
    const filteredLevels = levels.filter(l => l.level_number === levelNumber);
    return (
      <Grid item xs={12} md={6} lg={4} key={levelNumber}>
        <Card>
          <CardHeader
            title={levelNames[levelNumber]}
            action={
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm(null, levelNumber)}
              >
                Adaugă
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nume</TableCell>
                    <TableCell>Cod</TableCell>
                    <TableCell align="right">Acțiuni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLevels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell>{level.name}</TableCell>
                      <TableCell>{level.code}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleOpenForm(level)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(level.id!)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Management Nivele de Clasificare
      </Typography>
      <Grid container spacing={3}>
        {Object.keys(levelNames).map(levelNum => renderLevelCard(Number(levelNum)))}
      </Grid>
      <LevelForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveLevel}
        initialData={editingLevel}
      />
      <Dialog open={confirmDeleteOpen} onClose={handleCloseConfirmDelete}>
        <DialogTitle>Confirmare Ștergere</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sunteți sigur că doriți să ștergeți acest nivel? Această acțiune este ireversibilă.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete}>Anulează</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Șterge
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageLevels;