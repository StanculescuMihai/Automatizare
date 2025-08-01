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
import axios from 'axios';

import { useAuth } from '../../contexts/AuthContext';

interface Level {
  id: number;
  name: string;
  code: string;
  level_number: number;
  parent_id?: number;
}

// This interface represents the data structure from the API
interface FixedAssetAPI {
  id: number;
  unique_code: string;
  equipment_name: string;
  installation_address: string;
  status: 'in functiune' | 'in rezerva' | 'defect' | 'propuse spre casare';
  accounting_value: number;
  installation_date: string;
  description?: string;
  drive_link?: string;
  level1_id: number;
  level2_id: number;
  level3_id: number;
  level4_id: number;
  level5_id: number;
}

// This interface represents the form's internal state
interface FixedAssetFormData {
  id?: number;
  name: string;
  description?: string;
  acquisitionDate: string;
  acquisitionValue: number;
  currentValue: number;
  location: string;
  status: 'in functiune' | 'in rezerva' | 'defect' | 'propuse spre casare';
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
  asset?: FixedAssetAPI | null;
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
  console.log('--- Component Rendered ---', { mode, assetId: asset?.id });
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [formData, setFormData] = useState<FixedAssetFormData>({
    name: '',
    description: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionValue: 0,
    currentValue: 0,
    location: '',
    status: 'in functiune',
    photoUrl: '',
    sucursalaId: 0,
    tipSistemId: 0,
    categorieId: 0,
    functionalitateId: 0,
    componentaId: 0,
  });

  useEffect(() => {
    console.log('Effect for [open, asset, mode] triggered.');
    if (open) {
      console.log('Form is open. Fetching levels.');
      fetchLevels();
      if (asset && mode !== 'add') {
        // Map backend model to frontend form state
        setFormData({
          id: asset.id,
          name: asset.equipment_name,
          description: asset.description || '',
          acquisitionDate: asset.installation_date ? asset.installation_date.split('T')[0] : '',
          acquisitionValue: asset.accounting_value || 0,
          currentValue: asset.accounting_value || 0, // Assuming currentValue is same as accounting_value initially
          location: asset.installation_address || '',
          status: asset.status,
          photoUrl: asset.drive_link || '',
          sucursalaId: asset.level1_id,
          tipSistemId: asset.level2_id,
          categorieId: asset.level3_id,
          functionalitateId: asset.level4_id,
          componentaId: asset.level5_id,
        });
        setGeneratedCode(asset.unique_code);
      } else {
        resetForm();
      }
    }
  }, [open, asset, mode]);

  useEffect(() => {
    console.log('Effect for [formData] triggered. Checking if should generate code.');
    if (formData.sucursalaId && formData.tipSistemId && formData.categorieId &&
        formData.functionalitateId && formData.componentaId && formData.name) {
      console.log('All fields present. Generating code...');
      generateCode();
    }
  }, [formData.sucursalaId, formData.tipSistemId, formData.categorieId,
      formData.functionalitateId, formData.componentaId, formData.name]);

  const fetchLevels = async () => {
    console.log('Fetching levels from API...');
    try {
      const response = await axios.get('http://localhost:3001/api/levels');
      if (response.data && response.data.success) {
        console.log('Levels fetched successfully:', response.data.data);
        setLevels(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
      setError('Nu s-au putut încărca datele de clasificare.');
    }
  };

  const generateCode = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/fixed-assets/generate-code', {
        sucursalaId: formData.sucursalaId,
        tipSistemId: formData.tipSistemId,
        categorieId: formData.categorieId,
        functionalitateId: formData.functionalitateId,
        componentaId: formData.componentaId,
        equipmentName: formData.name,
      });
      if (response.data && response.data.code) {
        setGeneratedCode(response.data.code);
      }
    } catch (err: any) {
      console.error('Error generating code:', err);
      const errorMessage = err.response?.data?.message || 'A apărut o eroare la generarea codului.';
      setError(errorMessage);
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
      status: 'in functiune',
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
    console.log(`handleChange: field=${field}, value=${value}`);
    setFormData(prev => {
      const newState = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when parent changes
      if (field === 'sucursalaId') {
        newState.tipSistemId = 0;
        newState.categorieId = 0;
        newState.functionalitateId = 0;
        newState.componentaId = 0;
      } else if (field === 'tipSistemId') {
        newState.categorieId = 0;
        newState.functionalitateId = 0;
        newState.componentaId = 0;
      } else if (field === 'categorieId') {
        newState.functionalitateId = 0;
        newState.componentaId = 0;
      } else if (field === 'functionalitateId') {
        newState.componentaId = 0;
      }
      
      console.log('New form state after handleChange:', newState);
      return newState;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const url = mode === 'add'
        ? 'http://localhost:3001/api/fixed-assets'
        : `http://localhost:3001/api/fixed-assets/${asset?.id}`;
      
      const method = mode === 'add' ? 'post' : 'put';
      
      const backendPayload: any = {
        level1_id: formData.sucursalaId,
        level2_id: formData.tipSistemId,
        level3_id: formData.categorieId,
        level4_id: formData.functionalitateId,
        level5_id: formData.componentaId,
        equipment_name: formData.name,
        status: formData.status,
        installation_address: formData.location,
        description: formData.description,
        installation_date: formData.acquisitionDate || null,
        accounting_value: formData.acquisitionValue || null,
        drive_link: formData.photoUrl || null,
        asset_type: 'echipament',
        lifespan: 10,
      };

      // Only send unique_code if it's generated (for creation) or if editing
      if (mode === 'edit' && asset?.id) {
        // In edit mode, we might send the existing code if it's part of formData
        // Or let the backend handle it if it's not supposed to change.
        // For now, we assume it's not editable directly.
      } else if (mode === 'add' && generatedCode) {
         backendPayload.unique_code = generatedCode;
      }
      // If creating and no code is generated, we don't send the key,
      // so the backend is forced to generate it.

      await axios[method](url, backendPayload);

      onSave();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors ? err.response?.data?.errors.join(', ') : (err.response?.data?.message || 'Eroare la salvarea mijlocului fix');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getLevelsByType = (level: number, parentId?: number) => {
    return levels.filter(l => l.level_number === level);
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
              <InputLabel>Site</InputLabel>
              <Select
                value={formData.sucursalaId}
                label="Site"
                onChange={(e) => handleChange('sucursalaId', e.target.value)}
                disabled={mode === 'view'}
              >
                <MenuItem value={0}>Selectați site-ul</MenuItem>
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
              <InputLabel>Entitate</InputLabel>
              <Select
                value={formData.tipSistemId}
                label="Entitate"
                onChange={(e) => handleChange('tipSistemId', e.target.value)}
                disabled={mode === 'view' || !formData.sucursalaId}
              >
                <MenuItem value={0}>Selectați entitatea</MenuItem>
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
              <InputLabel>Unitate</InputLabel>
              <Select
                value={formData.categorieId}
                label="Unitate"
                onChange={(e) => handleChange('categorieId', e.target.value)}
                disabled={mode === 'view' || !formData.tipSistemId}
              >
                <MenuItem value={0}>Selectați unitatea</MenuItem>
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
              <InputLabel>Ansamblu funcțional</InputLabel>
              <Select
                value={formData.functionalitateId}
                label="Ansamblu funcțional"
                onChange={(e) => handleChange('functionalitateId', e.target.value)}
                disabled={mode === 'view' || !formData.categorieId}
              >
                <MenuItem value={0}>Selectați ansamblul</MenuItem>
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
              <InputLabel>Locație funcțională</InputLabel>
              <Select
                value={formData.componentaId}
                label="Locație funcțională"
                onChange={(e) => handleChange('componentaId', e.target.value)}
                disabled={mode === 'view' || !formData.functionalitateId}
              >
                <MenuItem value={0}>Selectați locația</MenuItem>
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
                <MenuItem value="in functiune">În funcțiune</MenuItem>
                <MenuItem value="in rezerva">În rezervă</MenuItem>
                <MenuItem value="defect">Defect</MenuItem>
                <MenuItem value="propuse spre casare">Propus spre casare</MenuItem>
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