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
  Switch,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { useSnackbar } from 'notistack';

interface User {
  id: number;
  fullName: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
}

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/users');
      setUsers(response.data.data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'A apărut o eroare la preluarea utilizatorilor.';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleAdmin = async (userId: number) => {
    try {
      const response = await axios.put(`http://localhost:3001/api/users/toggle-admin/${userId}`);
      if (response.data.success) {
        enqueueSnackbar('Rolul utilizatorului a fost actualizat cu succes!', { variant: 'success' });
        fetchUsers(); // Re-fetch users to update the list
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Nu s-a putut actualiza rolul utilizatorului.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Management Utilizatori
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nume Complet</TableCell>
              <TableCell>Nume Utilizator</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Data Creării</TableCell>
              <TableCell align="center">Administrator</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={user.role === 'admin'}
                    onChange={() => handleToggleAdmin(user.id)}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Admin;