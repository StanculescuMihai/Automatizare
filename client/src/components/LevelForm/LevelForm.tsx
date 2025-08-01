import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Make fields optional to match form state, validation is handled by yup schema
interface Level {
  id?: number;
  level_number?: number;
  name?: string;
  code?: string;
  description?: string;
}

interface LevelFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Level) => void;
  initialData?: Level | null;
}

const validationSchema = yup.object().shape({
  id: yup.number(),
  level_number: yup.number().required('Numărul nivelului este obligatoriu').min(1).max(5),
  name: yup.string().required('Numele este obligatoriu'),
  code: yup.string().required('Codul este obligatoriu'),
  description: yup.string(),
});

const LevelForm: React.FC<LevelFormProps> = ({ open, onClose, onSave, initialData }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Level>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      level_number: 1,
      name: '',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        level_number: 1,
        name: '',
        code: '',
        description: '',
      });
    }
  }, [initialData, open, reset]);

  const onSubmit = (data: Level) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Editează Nivel' : 'Adaugă Nivel Nou'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="level_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Număr Nivel"
                    variant="outlined"
                    fullWidth
                    disabled
                    error={!!errors.level_number}
                    helperText={errors.level_number?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nume"
                    variant="outlined"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cod"
                    variant="outlined"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descriere"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Anulează</Button>
          <Button type="submit" variant="contained" color="primary">
            Salvează
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LevelForm;