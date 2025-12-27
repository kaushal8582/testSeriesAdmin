'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Typography,
  TextField,
  MenuItem,
  Pagination,
} from '@mui/material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { referralApi, Referral } from '@/api/referral.api';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    referrerId: '',
  });

  useEffect(() => {
    loadReferrals();
  }, [page, filters]);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const result = await referralApi.getAllReferrals({
        page,
        limit: 20,
        ...filters,
      });
      setReferrals(result.referrals);
      setTotalPages(result.pagination.pages);
    } catch (error: any) {
      console.error('Failed to load referrals:', error);
      setError(error.message || 'Failed to load referrals');
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && referrals.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
          Referrals Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all referral activities
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Status"
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Referrer</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Referee</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Referral Code</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Referrer Reward</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Referee Reward</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Completed At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <TableRow key={referral._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {referral.referrerId.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {referral.referrerId.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {referral.refereeId.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {referral.refereeId.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{referral.referralCode}</TableCell>
                  <TableCell>
                    <Chip
                      label={referral.status}
                      color={
                        referral.status === 'completed'
                          ? 'success'
                          : referral.status === 'pending'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {referral.referrerReward.applied ? (
                      <Chip label={`${referral.referrerReward.value}%`} size="small" color="success" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {referral.refereeReward.applied ? (
                      <Chip label={`${referral.refereeReward.value}%`} size="small" color="success" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {referral.completedAt
                      ? new Date(referral.completedAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No referrals found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </AdminLayout>
  );
}

