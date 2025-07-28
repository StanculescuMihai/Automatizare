import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  InputAdornment,
  Chip,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
} from '@mui/icons-material';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, any>;
  onFilterChange: (field: string, value: any) => void;
  filterOptions: Record<string, FilterOption[]>;
  sortBy: string;
  onSortChange: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  sortOptions: FilterOption[];
  onClearFilters: () => void;
  searchPlaceholder?: string;
  showSorting?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  filterOptions,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  sortOptions,
  onClearFilters,
  searchPlaceholder = 'Căutare...',
  showSorting = true,
}) => {
  const activeFiltersCount = Object.values(filters).filter(
    value => value !== '' && value !== null && value !== undefined
  ).length;

  const hasActiveFilters = searchTerm.trim() !== '' || activeFiltersCount > 0;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Filter Fields */}
          {Object.entries(filterOptions).map(([field, options]) => (
            <Grid item xs={12} sm={6} md={2} key={field}>
              <FormControl fullWidth>
                <InputLabel>{field}</InputLabel>
                <Select
                  value={filters[field] || ''}
                  label={field}
                  onChange={(e) => onFilterChange(field, e.target.value)}
                >
                  <MenuItem value="">Toate</MenuItem>
                  {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}

          {/* Sorting */}
          {showSorting && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Sortare după</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sortare după"
                    onChange={(e) => onSortChange(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <SortIcon />
                      </InputAdornment>
                    }
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={1}>
                <FormControl fullWidth>
                  <InputLabel>Ordine</InputLabel>
                  <Select
                    value={sortOrder}
                    label="Ordine"
                    onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
                  >
                    <MenuItem value="asc">Crescător</MenuItem>
                    <MenuItem value="desc">Descrescător</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Clear Filters Button */}
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              sx={{ height: '56px' }}
            >
              Resetează
            </Button>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Filtre active:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {searchTerm.trim() && (
                <Chip
                  label={`Căutare: "${searchTerm}"`}
                  onDelete={() => onSearchChange('')}
                  size="small"
                  color="primary"
                />
              )}
              {Object.entries(filters).map(([field, value]) => {
                if (value === '' || value === null || value === undefined) return null;
                
                const options = filterOptions[field] || [];
                const option = options.find(opt => opt.value === value);
                const displayValue = option ? option.label : value;
                
                return (
                  <Chip
                    key={field}
                    label={`${field}: ${displayValue}`}
                    onDelete={() => onFilterChange(field, '')}
                    size="small"
                    color="secondary"
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;