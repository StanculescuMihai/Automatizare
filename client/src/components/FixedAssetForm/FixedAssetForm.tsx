import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

interface Level {
  id: number;
  name: string;
  code: string;
  level: number;
  parentId?: number;
}

interface FixedAsset {
  id?: number;
  name: string;
  description?: string;
  acquisitionDate: string;
  acquisitionValue: number;
  currentValue: number;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  photoUrl?: string;
  sucursalaId: number;
  tipSistemId: number;
  categorieId: number;
  functionalitateId: number;
  componentaId: number;
}

interface FixedAssetFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  asset?: FixedAsset | null;
  mode: 'add' | 'edit' | 'view';
}

const FixedAssetForm: React.FC<FixedAssetFormProps> = ({
  open,
  onClose,
  onSave,
  asset,
  mode,
}) => {
  const { user } = useAuth();
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [formData, setFormData] = useState<FixedAsset>({
    name: '',
    description: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionValue: 0,
    currentValue: 0,
    location: '',
    status: 'active',
    photoUrl: '',
    sucursalaId: 0,
    tipSistemId: 0,
    categorieId: 0,
    functionalitateId: 0,
    componentaId: 0,
  });

  useEffect(() => {
    if (open) {
      fetchLevels();
      if (asset && mode !== 'add') {
        setFormData({
          ...asset,
          acquisitionDate: asset.acquisitionDate.split('T')[0],
        });
      } else {
        resetForm();
      }
    }
  }, [open, asset, mode]);

  useEffect(() => {
    if (formData.sucursalaId && formData.tipSistemId && formData.categorieId && 
        formData.functionalitateId && formData.componentaId && formData.name) {
      generateCode();
    }
  }, [formData.sucursalaId, formData.tipSistemId, formData.categorieId, 
      formData.functionalitateId, formData.componentaId, formData.name]);

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

  const generateCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/fixed-assets/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sucursalaId: formData.sucursalaId,
          tipSistemId: formData.tipSistemId,
          categorieId: formData.categorieId,
          functionalitateId: formData.functionalitateId,
          componentaId: formData.componentaId,
          equipmentName: formData.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedCode(data.code);
      }
    } catch (err) {
      console.error('Error generating code:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionValue: 0,
      currentValue: 0,
      location: '',
      status: 'active',
      photoUrl: '',
      sucursalaId: 0,
      tipSistemId: 0,
      categorieId: 0,
      functionalitateId: 0,
      componentaId: 0,
    });
    setGeneratedCode('');
    setError('');
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Reset dependent fields when parent changes
    if (field === 'sucursalaId') {
      setFormData(prev => ({
        ...prev,
        tipSistemId: 0,
        categorieId: 0,
        functionalitateId: 0,
        componentaId: 0,
      }));
    } else if (field === 'tipSistemId') {
      setFormData(prev => ({
        ...prev,
        categorieId: 0,
        functionalitateId: 0,
        componentaId: 0,
      }));
    } else if (field === 'categorieId') {
      setFormData(prev => ({
        ...prev,
        functionalitateId: 0,
        componentaId: 0,
      }));
    } else if (field === 'functionalitateId') {
      setFormData(prev => ({
        ...prev,
        componentaId: 0,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const url = mode === 'add' 
        ? '/api/fixed-assets' 
        : `/api/fixed-assets/${asset?.id}`;
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      
      const payload = {
        ...formData,
        code: generatedCode,
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
        throw new Error(errorData.message || 'Eroare la salvarea mijlocului fix');
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Eroare la salvarea mijlocului fix');
    } finally {
      setLoading(false);
    }
  };

  const getLevelsByType = (level: number, parentId?: number) => {
    return levels.filter(l => {
      if (l.level !== level) return false;
      if (level === 1) return true; // Sucursale don't have parents
      return l.parentId === parentId;
    });
  };

  const getLevelName = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.name : '';
  };

  const isFormValid = () => {
    return formData.name && 
           formData.sucursalaId && 
           formData.tipSistemId && 
           formData.categorieId && 
           formData.functionalitateId && 
           formData.componentaId &&
           formData.acquisitionValue > 0 &&
           formData.currentValue >= 0 &&
           formData.location;
  };

  const getTitle = () => {
    switch (mode) {
      case 'add':
        return 'Adaugă Mijloc Fix';
      case 'edit':
        return 'Editează Mijloc Fix';
      case 'view':
        return 'Detalii Mijloc Fix';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {generatedCode && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Cod generat automat:
            </Typography>
            <Chip 
              label={generatedCode} 
              color="primary" 
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Informații de Bază
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nume Mijloc Fix"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              disabled={mode === 'view'}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Locație"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
              disabled={mode === 'view'}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descriere"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              rows={3}
              disabled={mode === 'view'}
            />
          </Grid>

          {/* Hierarchical Selection */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Clasificare Ierarhică
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Sucursala</InputLabel>
              <Select
                value={formData.sucursalaId}
                label="Sucursala"
                onChange={(e) => handleChange('sucursalaId', e.target.value)}
                disabled={mode === 'view'}
              >
                <MenuItem value={0}>Selectați sucursala</MenuItem>
                {getLevelsByType(1).map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name} ({level.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Tip Sistem</InputLabel>
              <Select
                value={formData.tipSistemId}
                label="Tip Sistem"
                onChange={(e) => handleChange('tipSistemId', e.target.value)}
                disabled={mode === 'view' || !formData.sucursalaId}
              >
                <MenuItem value={0}>Selectați tipul de sistem</MenuItem>
                {getLevelsByType(2, formData.sucursalaId).map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name} ({level.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Categorie</InputLabel>
              <Select
                value={formData.categorieId}
                label="Categorie"
                onChange={(e) => handleChange('categorieId', e.target.value)}
                disabled={mode === 'view' || !formData.tipSistemId}
              >
                <MenuItem value={0}>Selectați categoria</MenuItem>
                {getLevelsByType(3, formData.tipSistemId).map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name} ({level.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Funcționalitate</InputLabel>
              <Select
                value={formData.functionalitateId}
                label="Funcționalitate"
                onChange={(e) => handleChange('functionalitateId', e.target.value)}
                disabled={mode === 'view' || !formData.categorieId}
              >
                <MenuItem value={0}>Selectați funcționalitatea</MenuItem>
                {getLevelsByType(4, formData.categorieId).map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name} ({level.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Componentă</InputLabel>
              <Select
                value={formData.componentaId}
                label="Componentă"
                onChange={(e) => handleChange('componentaId', e.target.value)}
                disabled={mode === 'view' || !formData.functionalitateId}
              >
                <MenuItem value={0}>Selectați componenta</MenuItem>
                {getLevelsByType(5, formData.functionalitateId).map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name} ({level.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Financial Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Informații Financiare
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Data Achiziției"
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) => handleChange('acquisitionDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              disabled={mode === 'view'}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Valoare Achiziție"
              type="number"
              value={formData.acquisitionValue}
              onChange={(e) => handleChange('acquisitionValue', parseFloat(e.target.value) || 0)}
              InputProps={{
                endAdornment: <InputAdornment position="end">RON</InputAdornment>,
              }}
              required
              disabled={mode === 'view'}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Valoare Actuală"
              type="number"
              value={formData.currentValue}
              onChange={(e) => handleChange('currentValue', parseFloat(e.target.value) || 0)}
              InputProps={{
                endAdornment: <InputAdornment position="end">RON</InputAdornment>,
              }}
              required
              disabled={mode === 'view'}
            />
          </Grid>

          {/* Status and Photo */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Status și Media
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={mode === 'view'}
              >
                <MenuItem value="active">Activ</MenuItem>
                <MenuItem value="inactive">Inactiv</MenuItem>
                <MenuItem value="maintenance">Mentenanță</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Link Poză (Google Drive)"
              value={formData.photoUrl}
              onChange={(e) => handleChange('photoUrl', e.target.value)}
              placeholder="https://drive.google.com/..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhotoIcon />
                  </InputAdornment>
                ),
              }}
              disabled={mode === 'view'}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          {mode === 'view' ? 'Închide' : 'Anulează'}
        </Button>
        {mode !== 'view' && (
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Se salvează...' : (mode === 'add' ? 'Adaugă' : 'Salvează')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FixedAssetForm;