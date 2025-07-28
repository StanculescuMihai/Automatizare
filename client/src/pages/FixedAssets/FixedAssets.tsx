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
  TablePagination,
  IconButton,
  Chip,
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
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import FixedAssetForm from '../../components/FixedAssetForm/FixedAssetForm';

interface FixedAsset {
  id: number;
  name: string;
  code: string;
  description?: string;
  acquisitionDate: string;
  acquisitionValue: number;
  currentValue: number;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  photoUrl?: string;
  sucursala: string;
  tipSistem: string;
  categorie: string;
  functionalitate: string;
  componenta: string;
  createdAt: string;
  updatedAt: string;
}

interface Level {
  id: number;
  name: string;
  code: string;
  level: number;
  parentId?: number;
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
    sucursala: '',
    tipSistem: '',
    categorie: '',
    status: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');

  useEffect(() => {
    fetchAssets();
    fetchLevels();
  }, [page, rowsPerPage, searchTerm, filters]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        search: searchTerm,
        ...filters,
      });

      const response = await fetch(`/api/fixed-assets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Eroare la încărcarea mijloacelor fixe');
      }

      const data = await response.json();
      setAssets(data.assets);
      setTotalCount(data.total);
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/levels', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLevels(data);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

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
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/fixed-assets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Eroare la ștergerea mijlocului fix');
      }

      fetchAssets();
    } catch (err: any) {
      setError(err.message || 'Eroare la ștergerea mijlocului fix');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activ';
      case 'inactive':
        return 'Inactiv';
      case 'maintenance':
        return 'Mentenanță';
      default:
        return status;
    }
  };

  const getLevelsByType = (level: number) => {
    return levels.filter(l => l.level === level);
  };

  if (loading && assets.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Mijloace Fixe
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Adaugă Mijloc Fix
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Căutare după nume, cod sau descriere..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sucursala</InputLabel>
                <Select
                  value={filters.sucursala}
                  label="Sucursala"
                  onChange={(e) => handleFilterChange('sucursala', e.target.value)}
                >
                  <MenuItem value="">Toate</MenuItem>
                  {getLevelsByType(1).map((level) => (
                    <MenuItem key={level.id} value={level.name}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tip Sistem</InputLabel>
                <Select
                  value={filters.tipSistem}
                  label="Tip Sistem"
                  onChange={(e) => handleFilterChange('tipSistem', e.target.value)}
                >
                  <MenuItem value="">Toate</MenuItem>
                  {getLevelsByType(2).map((level) => (
                    <MenuItem key={level.id} value={level.name}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Categorie</InputLabel>
                <Select
                  value={filters.categorie}
                  label="Categorie"
                  onChange={(e) => handleFilterChange('categorie', e.target.value)}
                >
                  <MenuItem value="">Toate</MenuItem>
                  {getLevelsByType(3).map((level) => (
                    <MenuItem key={level.id} value={level.name}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Toate</MenuItem>
                  <MenuItem value="active">Activ</MenuItem>
                  <MenuItem value="inactive">Inactiv</MenuItem>
                  <MenuItem value="maintenance">Mentenanță</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Assets Table */}
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
                <TableCell>Valoare Actuală</TableCell>
                <TableCell>Data Achiziție</TableCell>
                <TableCell align="center">Acțiuni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {asset.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {asset.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{asset.location}</TableCell>
                  <TableCell>{asset.categorie}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(asset.status)}
                      color={getStatusColor(asset.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('ro-RO', {
                      style: 'currency',
                      currency: 'RON',
                    }).format(asset.currentValue)}
                  </TableCell>
                  <TableCell>
                    {new Date(asset.acquisitionDate).toLocaleDateString('ro-RO')}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Vizualizare">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('view', asset)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editare">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('edit', asset)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ștergere">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAsset(asset.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
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
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} din ${count !== -1 ? count : `mai mult de ${to}`}`
          }
        />
      </Paper>

      {/* Fixed Asset Form Dialog */}
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