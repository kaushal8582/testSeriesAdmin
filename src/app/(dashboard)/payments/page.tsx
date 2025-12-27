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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { paymentApi, Payment } from '@/api/payment.api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    userId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadPayments();
  }, [page, filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const result = await paymentApi.getAllPayments({
        page,
        limit: 20,
        ...filters,
      });
      setPayments(result.payments);
      setTotalPages(result.pagination.pages);
    } catch (error: any) {
      console.error('Failed to load payments:', error);
      setError(error.message || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = async (paymentId: string) => {
    try {
      const payment = await paymentApi.getPaymentById(paymentId);
      setSelectedPayment(payment);
      setViewDialog(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load payment details');
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (loading && payments.length === 0) {
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
          Payments Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View all payment transactions and tracking information
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
          <MenuItem value="initiated">Initiated</MenuItem>
          <MenuItem value="clicked">Clicked</MenuItem>
          <MenuItem value="processing">Processing</MenuItem>
          <MenuItem value="success">Success</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
        <TextField
          label="Start Date"
          type="date"
          value={filters.startDate}
          onChange={(e) => {
            setFilters({ ...filters, startDate: e.target.value });
            setPage(1);
          }}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={filters.endDate}
          onChange={(e) => {
            setFilters({ ...filters, endDate: e.target.value });
            setPage(1);
          }}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Plan</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Attempt</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Initiated</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Completed</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {payment.userId.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.userId.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.subscriptionPlanId.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payment.subscriptionPlanId.durationLabel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{payment.finalAmount.toLocaleString('en-IN')}
                    </Typography>
                    {payment.discountAmount > 0 && (
                      <Typography variant="caption" color="success.main">
                        -₹{payment.discountAmount.toLocaleString('en-IN')} discount
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.paymentStatus}
                      color={
                        payment.paymentStatus === 'success'
                          ? 'success'
                          : payment.paymentStatus === 'failed'
                          ? 'error'
                          : payment.paymentStatus === 'clicked'
                          ? 'info'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">#{payment.attemptNumber}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatDate(payment.paymentInitiatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {payment.paymentStatus === 'success'
                        ? formatDate(payment.paymentCompletedAt)
                        : payment.paymentStatus === 'failed'
                        ? formatDate(payment.paymentFailedAt)
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewPayment(payment._id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No payments found.
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

      {/* Payment Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Payment Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayment.userId.name} ({selectedPayment.userId.email})
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Plan
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayment.subscriptionPlanId.name} - {selectedPayment.subscriptionPlanId.durationLabel}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Amount Details
                </Typography>
                <Typography variant="body1">
                  Original: ₹{selectedPayment.amount.toLocaleString('en-IN')}
                </Typography>
                {selectedPayment.discountAmount > 0 && (
                  <Typography variant="body1" color="success.main">
                    Discount: -₹{selectedPayment.discountAmount.toLocaleString('en-IN')}
                    {selectedPayment.promoCodeId && ` (${selectedPayment.promoCodeId.code})`}
                  </Typography>
                )}
                {selectedPayment.referralDiscount > 0 && (
                  <Typography variant="body1" color="info.main">
                    Referral Discount: -₹{selectedPayment.referralDiscount.toLocaleString('en-IN')}
                    {selectedPayment.referralCode && ` (${selectedPayment.referralCode})`}
                  </Typography>
                )}
                <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                  Final: ₹{selectedPayment.finalAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Status
                </Typography>
                <Chip
                  label={selectedPayment.paymentStatus}
                  color={
                    selectedPayment.paymentStatus === 'success'
                      ? 'success'
                      : selectedPayment.paymentStatus === 'failed'
                      ? 'error'
                      : 'default'
                  }
                />
                {selectedPayment.failureReason && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Reason: {selectedPayment.failureReason}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tracking Timeline
                </Typography>
                <Typography variant="body2">
                  Initiated: {formatDate(selectedPayment.paymentInitiatedAt)}
                </Typography>
                {selectedPayment.paymentClickedAt && (
                  <Typography variant="body2">
                    Clicked: {formatDate(selectedPayment.paymentClickedAt)}
                  </Typography>
                )}
                {selectedPayment.paymentCompletedAt && (
                  <Typography variant="body2" color="success.main">
                    Completed: {formatDate(selectedPayment.paymentCompletedAt)}
                  </Typography>
                )}
                {selectedPayment.paymentFailedAt && (
                  <Typography variant="body2" color="error.main">
                    Failed: {formatDate(selectedPayment.paymentFailedAt)}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Attempt Number
                </Typography>
                <Typography variant="body1">#{selectedPayment.attemptNumber}</Typography>
              </Box>
              {selectedPayment.razorpayOrderId && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Razorpay Order ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedPayment.razorpayOrderId}
                  </Typography>
                </Box>
              )}
              {selectedPayment.razorpayPaymentId && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Razorpay Payment ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedPayment.razorpayPaymentId}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

