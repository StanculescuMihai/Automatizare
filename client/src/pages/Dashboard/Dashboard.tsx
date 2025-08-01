import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalAssets: number;
  assetsByLocation: Array<{
    location: string;
    count: number;
  }>;
  assetsByCategory: Array<{
    category: string;
    count: number;
  }>;
  recentAssets: Array<{
    id: number;
    name: string;
    code: string;
    location: string;
    createdAt: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/dashboard/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Eroare la încărcarea datelor');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err: any) {
      setError(err.message || 'Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert severity="info">
        Nu există date disponibile
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Bună ziua, {user?.name}! Iată o privire de ansamblu asupra mijloacelor fixe.
      </Typography>

      <Grid container spacing={3}>
        {/* Total Assets Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BuildIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Mijloace Fixe
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalAssets}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Locations Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Locații Active
                  </Typography>
                  <Typography variant="h4">
                    {stats.assetsByLocation?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Categories Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CategoryIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Categorii
                  </Typography>
                  <Typography variant="h4">
                    {stats.assetsByCategory?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Growth */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Această Lună
                  </Typography>
                  <Typography variant="h4">
                    {stats.monthlyTrend?.[stats.monthlyTrend.length - 1]?.count || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Assets by Location */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Distribuție pe Locații
            </Typography>
            <List>
              {stats.assetsByLocation?.slice(0, 5).map((location, index) => (
                <React.Fragment key={location.location}>
                  <ListItem>
                    <ListItemText
                      primary={location.location}
                      secondary={`${location.count} mijloace fixe`}
                    />
                    <Chip
                      label={location.count}
                      color="primary"
                      size="small"
                    />
                  </ListItem>
                  {index < Math.min(stats.assetsByLocation?.length - 1, 4) && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Assets by Category */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Distribuție pe Categorii
            </Typography>
            <List>
              {stats.assetsByCategory?.slice(0, 5).map((category, index) => (
                <React.Fragment key={category.category}>
                  <ListItem>
                    <ListItemText
                      primary={category.category}
                      secondary={`${category.count} mijloace fixe`}
                    />
                    <Chip
                      label={category.count}
                      color="secondary"
                      size="small"
                    />
                  </ListItem>
                  {index < Math.min(stats.assetsByCategory?.length - 1, 4) && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Assets */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Mijloace Fixe Adăugate Recent
            </Typography>
            <List>
              {stats.recentAssets?.map((asset, index) => (
                <React.Fragment key={asset.id}>
                  <ListItem>
                    <ListItemIcon>
                      <BuildIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={asset.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span">
                            Cod: {asset.code} • Locație: {asset.location}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Adăugat: {new Date(asset.createdAt).toLocaleDateString('ro-RO')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < (stats.recentAssets?.length || 0) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {stats.recentAssets?.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Nu există mijloace fixe adăugate recent
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;