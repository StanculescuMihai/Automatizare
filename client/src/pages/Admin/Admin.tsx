import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountTree as TreeIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

interface Level {
  id: number;
  name: string;
  code: string;
  level: number;
  parentId?: number;
  children?: Level[];
  createdAt: string;
  updatedAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: 1,
    parentId: '',
  });

  const levelNames = [
    'Sucursale',
    'Tipuri Sisteme',
    'Categorii',
    'Funcționalități',
    'Componente',
  ];

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Nu aveți permisiuni de administrator');
      return;
    }
    fetchLevels();
  }, [user]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/levels', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Eroare la încărcarea nivelurilor');
      }

      const data = await response.json();
      setLevels(data);
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (mode: 'add' | 'edit', level?: Level) => {
    setDialogMode(mode);
    if (mode === 'edit' && level) {
      setSelectedLevel(level);
      setFormData({
        name: level.name,
        code: level.code,
        level: level.level,
        parentId: level.parentId?.toString() || '',
      });
    } else {
      setSelectedLevel(null);
      setFormData({
        name: '',
        code: '',
        level: tabValue + 1,
        parentId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLevel(null);
    setFormData({
      name: '',
      code: '',
      level: 1,
      parentId: '',
    });
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveLevel = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = dialogMode === 'add' 
        ? '/api/levels' 
        : `/api/levels/${selectedLevel?.id}`;
      
      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      
      const payload = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la salvarea nivelului');
      }

      handleCloseDialog();
      fetchLevels();
    } catch (err: any) {
      setError(err.message || 'Eroare la salvarea nivelului');
    }
  };

  const handleDeleteLevel = async (id: number) => {
    if (!window.confirm('Sunteți sigur că doriți să ștergeți acest nivel? Această acțiune va șterge și toate subnivele asociate.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/levels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la ștergerea nivelului');
      }

      fetchLevels();
    } catch (err: any) {
      setError(err.message || 'Eroare la ștergerea nivelului');
    }
  };

  const getLevelsByType = (level: number) => {
    return levels.filter(l => l.level === level);
  };

  const getParentLevels = (level: number) => {
    if (level <= 1) return [];
    return levels.filter(l => l.level === level - 1);
  };

  const getParentName = (parentId?: number) => {
    if (!parentId) return '-';
    const parent = levels.find(l => l.id === parentId);
    return parent ? parent.name : '-';
  };

  if (user?.role !== 'admin') {
    return (
      <Alert severity="error">
        Nu aveți permisiuni de administrator pentru a accesa această pagină.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Administrare
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gestionați structura ierarhică a mijloacelor fixe
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            {levelNames.map((name, index) => (
              <Tab
                key={index}
                label={`${name} (${getLevelsByType(index + 1).length})`}
                id={`admin-tab-${index}`}
                aria-controls={`admin-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {levelNames.map((levelName, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Gestionare {levelName}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('add')}
              >
                Adaugă {levelName.slice(0, -1)}
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cod</TableCell>
                    <TableCell>Nume</TableCell>
                    {index > 0 && <TableCell>Părinte</TableCell>}
                    <TableCell>Data Creării</TableCell>
                    <TableCell align="center">Acțiuni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getLevelsByType(index + 1).map((level) => (
                    <TableRow key={level.id} hover>
                      <TableCell>
                        <Chip label={level.code} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {level.name}
                        </Typography>
                      </TableCell>
                      {index > 0 && (
                        <TableCell>
                          {getParentName(level.parentId)}
                        </TableCell>
                      )}
                      <TableCell>
                        {new Date(level.createdAt).toLocaleDateString('ro-RO')}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editare">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('edit', level)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ștergere">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteLevel(level.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {getLevelsByType(index + 1).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={index > 0 ? 5 : 4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Nu există {levelName.toLowerCase()} definite
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        ))}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Adaugă' : 'Editează'} {levelNames[formData.level - 1]?.slice(0, -1)}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nume"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cod"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value)}
                required
                helperText="Codul va fi folosit pentru generarea codurilor mijloacelor fixe"
              />
            </Grid>
            {formData.level > 1 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Părinte</InputLabel>
                  <Select
                    value={formData.parentId}
                    label="Părinte"
                    onChange={(e) => handleFormChange('parentId', e.target.value)}
                  >
                    <MenuItem value="">Selectați părintele</MenuItem>
                    {getParentLevels(formData.level).map((parent) => (
                      <MenuItem key={parent.id} value={parent.id.toString()}>
                        {parent.name} ({parent.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Anulează
          </Button>
          <Button
            onClick={handleSaveLevel}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formData.name || !formData.code}
          >
            {dialogMode === 'add' ? 'Adaugă' : 'Salvează'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;