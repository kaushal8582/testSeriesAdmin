'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { promoCodeApi, PromoCode, CreatePromoCodeData } from '@/api/promoCode.api';
import { subscriptionPlanApi, SubscriptionPlan } from '@/api/subscription.api';

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreatePromoCodeData>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscountAmount: undefined,
    minOrderAmount: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUsage: undefined,
    maxUsagePerUser: 1,
    applicablePlans: [],
  });

  useEffect(() => {
    loadPromoCodes();
    loadPlans();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const promoCodesData = await promoCodeApi.getPromoCodes();
      setPromoCodes(promoCodesData);
    } catch (error: any) {
      console.error('Failed to load promo codes:', error);
      setError(error.message || 'Failed to load promo codes');
      setPromoCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const plansData = await subscriptionPlanApi.getPlans();
      setPlans(plansData);
    } catch (error: any) {
      console.error('Failed to load plans:', error);
    }
  };

  const handleOpenDialog = (promoCode?: PromoCode) => {
    if (promoCode) {
      setEditingPromoCode(promoCode);
      setFormData({
        code: promoCode.code,
        name: promoCode.name,
        description: promoCode.description || '',
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        maxDiscountAmount: promoCode.maxDiscountAmount,
        minOrderAmount: promoCode.minOrderAmount,
        validFrom: new Date(promoCode.validFrom).toISOString().split('T')[0],
        validUntil: new Date(promoCode.validUntil).toISOString().split('T')[0],
        maxUsage: promoCode.maxUsage,
        maxUsagePerUser: promoCode.maxUsagePerUser,
        applicablePlans: promoCode.applicablePlans || [],
      });
    } else {
      setEditingPromoCode(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        maxDiscountAmount: undefined,
        minOrderAmount: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxUsage: undefined,
        maxUsagePerUser: 1,
        applicablePlans: [],
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPromoCode(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const submitData = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
      };
      if (editingPromoCode) {
        await promoCodeApi.updatePromoCode(editingPromoCode._id, submitData);
      } else {
        await promoCodeApi.createPromoCode(submitData);
      }
      handleCloseDialog();
      loadPromoCodes();
    } catch (error: any) {
      setError(error.message || 'Failed to save promo code');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await promoCodeApi.deletePromoCode(id);
      setDeleteConfirm(null);
      loadPromoCodes();
    } catch (error: any) {
      setError(error.message || 'Failed to delete promo code');
    }
  };

  const formatDiscount = (promoCode: PromoCode) => {
    if (promoCode.discountType === 'percentage') {
      return `${promoCode.discountValue}%${promoCode.maxDiscountAmount ? ` (Max ₹${promoCode.maxDiscountAmount})` : ''}`;
    }
    return `₹${promoCode.discountValue}`;
  };

  if (loading) {
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Promo Codes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage promo codes with discount values
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
            }}
          >
            Create Promo Code
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Discount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Used</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Valid Until</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promoCodes.length > 0 ? (
              promoCodes.map((promoCode) => (
                <TableRow key={promoCode._id}>
                  <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {promoCode.code}
                  </TableCell>
                  <TableCell>{promoCode.name}</TableCell>
                  <TableCell>{formatDiscount(promoCode)}</TableCell>
                  <TableCell>
                    {promoCode.maxUsage
                      ? `${promoCode.usedCount}/${promoCode.maxUsage}`
                      : `${promoCode.usedCount} (Unlimited)`}
                  </TableCell>
                  <TableCell>{new Date(promoCode.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={promoCode.isActive ? 'Active' : 'Inactive'}
                      color={promoCode.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(promoCode)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirm(promoCode._id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No promo codes found. Create your first promo code to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {editingPromoCode ? 'Edit Promo Code' : 'Create New Promo Code'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Promo Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              fullWidth
              required
              placeholder="e.g., SAVE20, WELCOME50"
              helperText="Code will be converted to uppercase"
            />
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              select
              label="Discount Type"
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
              fullWidth
              required
            >
              <MenuItem value="percentage">Percentage</MenuItem>
              <MenuItem value="fixed">Fixed Amount</MenuItem>
            </TextField>
            <TextField
              label={formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
              fullWidth
              required
              inputProps={{ min: 0, max: formData.discountType === 'percentage' ? 100 : undefined }}
            />
            {formData.discountType === 'percentage' && (
              <TextField
                label="Max Discount Amount (₹)"
                type="number"
                value={formData.maxDiscountAmount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                fullWidth
                helperText="Optional: Maximum discount amount for percentage discounts"
              />
            )}
            <TextField
              label="Minimum Order Amount (₹)"
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Max Usage (Total)"
              type="number"
              value={formData.maxUsage || ''}
              onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value ? parseInt(e.target.value) : undefined })}
              fullWidth
              helperText="Leave empty for unlimited usage"
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Max Usage Per User"
              type="number"
              value={formData.maxUsagePerUser}
              onChange={(e) => setFormData({ ...formData, maxUsagePerUser: parseInt(e.target.value) || 1 })}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              select
              label="Applicable Plans"
              SelectProps={{
                multiple: true,
                value: formData.applicablePlans || [],
                onChange: (e) => setFormData({ ...formData, applicablePlans: e.target.value as string[] }),
              }}
              fullWidth
              helperText="Leave empty to apply to all plans. Hold Ctrl/Cmd to select multiple."
            >
              {plans.map((plan) => (
                <MenuItem key={plan._id} value={plan._id}>
                  {plan.name} - {plan.durationLabel}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', px: 3 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ textTransform: 'none', px: 3, fontWeight: 600 }}
          >
            {editingPromoCode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this promo code? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

