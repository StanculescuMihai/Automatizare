import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Link,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  PhotoCamera as PhotoIcon,
  Link as LinkIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface GoogleDriveIntegrationProps {
  photoUrl?: string;
  onPhotoUrlChange: (url: string) => void;
  disabled?: boolean;
}

const GoogleDriveIntegration: React.FC<GoogleDriveIntegrationProps> = ({
  photoUrl = '',
  onPhotoUrlChange,
  disabled = false,
}) => {
  const [tempUrl, setTempUrl] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleOpenDialog = () => {
    setTempUrl(photoUrl);
    setError('');
    setPreviewUrl('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTempUrl('');
    setError('');
    setPreviewUrl('');
  };

  const validateGoogleDriveUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is valid
    
    const googleDrivePatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /^https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/,
    ];
    
    return googleDrivePatterns.some(pattern => pattern.test(url));
  };

  const convertToDirectUrl = (url: string): string => {
    if (!url) return '';
    
    // Extract file ID from various Google Drive URL formats
    let fileId = '';
    
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /\/document\/d\/([a-zA-Z0-9_-]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }
    
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    return url;
  };

  const handlePreview = () => {
    if (!tempUrl) {
      setError('Introduceți un URL pentru previzualizare');
      return;
    }
    
    if (!validateGoogleDriveUrl(tempUrl)) {
      setError('URL-ul nu pare să fie un link valid Google Drive');
      return;
    }
    
    const directUrl = convertToDirectUrl(tempUrl);
    setPreviewUrl(directUrl);
    setError('');
  };

  const handleSave = () => {
    if (tempUrl && !validateGoogleDriveUrl(tempUrl)) {
      setError('URL-ul nu pare să fie un link valid Google Drive');
      return;
    }
    
    onPhotoUrlChange(tempUrl);
    handleCloseDialog();
  };

  const handleRemovePhoto = () => {
    onPhotoUrlChange('');
  };

  const getDisplayUrl = () => {
    return photoUrl ? convertToDirectUrl(photoUrl) : '';
  };

  return (
    <Box>
      {photoUrl ? (
        <Card sx={{ maxWidth: 300, mb: 2 }}>
          <CardMedia
            component="img"
            height="200"
            image={getDisplayUrl()}
            alt="Poză mijloc fix"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Poză Google Drive
              </Typography>
              <Box>
                <Tooltip title="Vizualizare în Google Drive">
                  <IconButton
                    size="small"
                    onClick={() => window.open(photoUrl, '_blank')}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editare link">
                  <IconButton
                    size="small"
                    onClick={handleOpenDialog}
                    disabled={disabled}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminare poză">
                  <IconButton
                    size="small"
                    onClick={handleRemovePhoto}
                    disabled={disabled}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outlined"
          startIcon={<PhotoIcon />}
          onClick={handleOpenDialog}
          disabled={disabled}
          sx={{ mb: 2 }}
        >
          Adaugă Poză Google Drive
        </Button>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LinkIcon />
            {photoUrl ? 'Editează Link Google Drive' : 'Adaugă Link Google Drive'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="URL Google Drive"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              helperText="Introduceți link-ul către fișierul din Google Drive"
              sx={{ mb: 2 }}
            />
            
            <Box display="flex" gap={1} mb={2}>
              <Button
                variant="outlined"
                onClick={handlePreview}
                disabled={!tempUrl}
              >
                Previzualizare
              </Button>
              {tempUrl && (
                <Button
                  variant="outlined"
                  onClick={() => window.open(tempUrl, '_blank')}
                  startIcon={<ViewIcon />}
                >
                  Deschide în Google Drive
                </Button>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {previewUrl && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Previzualizare:
                </Typography>
                <Card>
                  <CardMedia
                    component="img"
                    height="300"
                    image={previewUrl}
                    alt="Previzualizare"
                    onError={() => setError('Nu s-a putut încărca imaginea. Verificați că fișierul este public și este o imagine.')}
                    sx={{ objectFit: 'contain' }}
                  />
                </Card>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Instrucțiuni:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                1. Încărcați imaginea în Google Drive<br/>
                2. Faceți click dreapta pe fișier → "Obțineți link"<br/>
                3. Setați permisiunile la "Oricine cu link-ul poate vizualiza"<br/>
                4. Copiați și lipiți link-ul aici
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Anulează
          </Button>
          <Button onClick={handleSave} variant="contained">
            Salvează
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoogleDriveIntegration;