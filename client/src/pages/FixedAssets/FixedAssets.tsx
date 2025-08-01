import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  TablePagination,
  IconButton,
  Chip,
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
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import FixedAssetForm from '../../components/FixedAssetForm/FixedAssetForm';

// This interface should match the structure of the data received from the API
interface Level {
  id: number;
  name: string;
  code: string;
  level_number: number;
}

interface FixedAsset {
  id: number;
  unique_code: string;
  equipment_name: string;
  installation_address: string;
  status: 'in functiune' | 'in rezerva' | 'defect' | 'propuse spre casare';
  accounting_value: number;
  installation_date: string;
  level1_id: number;
  level2_id: number;
  level3_id: number;
  level4_id: number;
  level5_id: number;
  level1?: Level;
  level2?: Level;
  level3?: Level;
  level4?: Level;
  level5?: Level;
  // Add other fields from the backend model as needed
  [key: string]: any; // Allow other properties
}

const FixedAssets: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '', // Corresponds to level1 code
    status: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        search: searchTerm,
        location: filters.location,
        status: filters.status,
      });

      const response = await axios.get(`http://localhost:3001/api/fixed-assets?${queryParams}`);
      
      if (response.data && response.data.success) {
        setAssets(response.data.data);
        setTotalCount(response.data.pagination.total);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, JSON.stringify(filters)]);

  const fetchLevels = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/levels');
      if (response.data && response.data.success) {
        setLevels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0);
  };

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', asset?: FixedAsset) => {
    setDialogMode(mode);
    setSelectedAsset(asset || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAsset(null);
  };

  const handleDeleteAsset = async (id: number) => {
    if (!window.confirm('Sunteți sigur că doriți să ștergeți acest mijloc fix?')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/api/fixed-assets/${id}`);
      fetchAssets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Eroare la ștergerea mijlocului fix');
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' | 'primary' | 'secondary' => {
    switch (status) {
      case 'in functiune': return 'success';
      case 'in rezerva': return 'primary';
      case 'defect': return 'error';
      case 'propuse spre casare': return 'warning';
      default: return 'default';
    }
  };

  if (loading && assets.length === 0) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Mijloace Fixe</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('add')}>
          Adaugă Mijloc Fix
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Căutare după nume, cod sau descriere..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Site</InputLabel>
                <Select
                  value={filters.location}
                  label="Site"
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <MenuItem value="">Toate</MenuItem>
                  {levels.filter(l => l.level_number === 1).map((level) => (
                    <MenuItem key={level.id} value={level.code}>{level.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Toate</MenuItem>
                  <MenuItem value="in functiune">În funcțiune</MenuItem>
                  <MenuItem value="in rezerva">În rezervă</MenuItem>
                  <MenuItem value="defect">Defect</MenuItem>
                  <MenuItem value="propuse spre casare">Propus spre casare</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cod</TableCell>
                <TableCell>Nume</TableCell>
                <TableCell>Locație</TableCell>
                <TableCell>Categorie</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Valoare Contabilă</TableCell>
                <TableCell>Data Instalării</TableCell>
                <TableCell align="center">Acțiuni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{asset.unique_code}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{asset.equipment_name}</Typography>
                  </TableCell>
                  <TableCell>{asset.installation_address}</TableCell>
                  <TableCell>{asset.level3?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={asset.status} color={getStatusColor(asset.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(asset.accounting_value || 0)}
                  </TableCell>
                  <TableCell>
                    {asset.installation_date ? new Date(asset.installation_date).toLocaleDateString('ro-RO') : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Vizualizare">
                      <IconButton size="small" onClick={() => handleOpenDialog('view', asset)}><ViewIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Editare">
                      <IconButton size="small" onClick={() => handleOpenDialog('edit', asset)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Ștergere">
                      <IconButton size="small" onClick={() => handleDeleteAsset(asset.id)} color="error"><DeleteIcon /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rânduri per pagină:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} din ${count}`}
        />
      </Paper>

      <FixedAssetForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={fetchAssets}
        asset={selectedAsset}
        mode={dialogMode}
      />
    </Box>
  );
};

export default FixedAssets;