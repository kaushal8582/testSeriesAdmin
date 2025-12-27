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
import { subscriptionPlanApi, SubscriptionPlan, CreateSubscriptionPlanData } from '@/api/subscription.api';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateSubscriptionPlanData>({
    name: '',
    description: '',
    planType: 'basic',
    duration: 30,
    durationLabel: '1 Month',
    price: 0,
    currency: 'INR',
    trialPeriod: 0,
    features: [],
    order: 1,
    isPopular: false,
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plansData = await subscriptionPlanApi.getPlans();
      setPlans(plansData);
    } catch (error: any) {
      console.error('Failed to load plans:', error);
      setError(error.message || 'Failed to load subscription plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        planType: plan.planType,
        duration: plan.duration || 30,
        durationLabel: plan.durationLabel,
        price: plan.price,
        currency: plan.currency,
        trialPeriod: plan.trialPeriod,
        features: plan.features || [],
        order: plan.order,
        isPopular: plan.isPopular,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        planType: 'basic',
        duration: 30,
        durationLabel: '1 Month',
        price: 0,
        currency: 'INR',
        trialPeriod: 0,
        features: [],
        order: plans.length + 1,
        isPopular: false,
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
    setError('');
    setNewFeature('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingPlan) {
        await subscriptionPlanApi.updatePlan(editingPlan._id, formData);
      } else {
        await subscriptionPlanApi.createPlan(formData);
      }
      handleCloseDialog();
      loadPlans();
    } catch (error: any) {
      setError(error.message || 'Failed to save subscription plan');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await subscriptionPlanApi.deletePlan(id);
      setDeleteConfirm(null);
      loadPlans();
    } catch (error: any) {
      setError(error.message || 'Failed to delete subscription plan');
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
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
              Subscription Plans
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage subscription plans
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
            Create Plan
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
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Price</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Trial</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Popular</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell sx={{ fontWeight: 500 }}>{plan.name}</TableCell>
                  <TableCell>
                    <Chip label={plan.planType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{plan.durationLabel}</TableCell>
                  <TableCell>₹{plan.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{plan.trialPeriod > 0 ? `${plan.trialPeriod} days` : 'No'}</TableCell>
                  <TableCell>
                    {plan.isPopular && <Chip label="Popular" size="small" color="primary" />}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={plan.isActive ? 'Active' : 'Inactive'}
                      color={plan.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(plan)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirm(plan._id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No subscription plans found. Create your first plan to get started.
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
            {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
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
              label="Plan Name"
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
              label="Plan Type"
              value={formData.planType}
              onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
              fullWidth
              required
            >
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
              <MenuItem value="lifetime">Lifetime</MenuItem>
            </TextField>
            <TextField
              label="Duration Label"
              value={formData.durationLabel}
              onChange={(e) => setFormData({ ...formData, durationLabel: e.target.value })}
              fullWidth
              required
              placeholder="e.g., 1 Month, 2 Months, 1 Year, 2 Years"
              helperText="Display label for duration"
            />
            <TextField
              label="Duration (days)"
              type="number"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : null })}
              fullWidth
              disabled={formData.planType === 'lifetime'}
              helperText={formData.planType === 'lifetime' ? 'Lifetime plans have no duration' : 'Number of days'}
            />
            <TextField
              label="Price (₹)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              fullWidth
              required
              disabled={formData.planType === 'free'}
            />
            <TextField
              label="Trial Period (days)"
              type="number"
              value={formData.trialPeriod}
              onChange={(e) => setFormData({ ...formData, trialPeriod: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                />
              }
              label="Mark as Popular"
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Features
              </Typography>
              {formData.features && formData.features.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  {formData.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      onDelete={() => removeFeature(index)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Add feature"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  size="small"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.nativeEvent.key === 'Enter') {
                      addFeature();
                    }
                  }}
                />
                <Button variant="outlined" onClick={addFeature} size="small">
                  Add
                </Button>
              </Box>
            </Box>
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
            {editingPlan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this subscription plan? This action cannot be undone.</Typography>
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

