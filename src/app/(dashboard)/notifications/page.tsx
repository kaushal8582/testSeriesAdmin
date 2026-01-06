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
  Grid,
  Card,
  CardContent,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  notificationApi,
  Notification,
  CreateNotificationData,
} from '@/api/notification.api';
import { userApi } from '@/api/user.api';
import { categoryApi } from '@/api/category.api';
import { examApi } from '@/api/exam.api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateNotificationData>({
    title: '',
    body: '',
    image: '',
    recipientType: 'all',
    recipients: {},
    scheduledFor: undefined,
    isRecurring: false,
    recurringPattern: undefined,
  });
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedExams, setSelectedExams] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
    loadUsers();
    loadCategories();
    loadExams();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notifications = await notificationApi.getNotifications();
      setNotifications(notifications);
    } catch (error: any) {
      console.error('Failed to load notifications:', error);
      setError(error.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userApi.getUsers({ limit: 1000 });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await categoryApi.getCategories();
      setCategories(categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadExams = async () => {
    try {
      const response = await examApi.getExams();
      setExams(response.exams || []);
    } catch (error) {
      console.error('Failed to load exams:', error);
    }
  };

  const handleOpenDialog = (notification?: Notification) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        body: notification.body,
        image: notification.image || '',
        recipientType: notification.recipientType,
        recipients: notification.recipients,
        scheduledFor: notification.scheduledFor,
        isRecurring: notification.isRecurring,
        recurringPattern: notification.recurringPattern,
      });
      if (notification.recipientType === 'specific' && notification.recipients.userIds) {
        setSelectedUsers(
          users.filter((u) => notification.recipients.userIds?.includes(u._id))
        );
      }
      if (notification.recipientType === 'category' && notification.recipients.categoryIds) {
        setSelectedCategories(
          categories.filter((c) => notification.recipients.categoryIds?.includes(c._id))
        );
      }
      if (notification.recipientType === 'exam' && notification.recipients.examIds) {
        setSelectedExams(
          exams.filter((e) => notification.recipients.examIds?.includes(e._id))
        );
      }
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        body: '',
        image: '',
        recipientType: 'all',
        recipients: {},
        scheduledFor: undefined,
        isRecurring: false,
        recurringPattern: undefined,
      });
      setSelectedUsers([]);
      setSelectedCategories([]);
      setSelectedExams([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNotification(null);
    setFormData({
      title: '',
      body: '',
      image: '',
      recipientType: 'all',
      recipients: {},
      scheduledFor: undefined,
      isRecurring: false,
      recurringPattern: undefined,
    });
    setSelectedUsers([]);
    setSelectedCategories([]);
    setSelectedExams([]);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      // Validation
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!formData.body.trim()) {
        setError('Body is required');
        return;
      }
      if (formData.isRecurring && !formData.recurringPattern) {
        setError('Please select a recurring pattern (Daily, Weekly, or Monthly)');
        return;
      }

      // Prepare recipients based on recipient type
      let recipients: any = {};
      if (formData.recipientType === 'specific') {
        if (selectedUsers.length === 0) {
          setError('Please select at least one user');
          return;
        }
        recipients.userIds = selectedUsers.map((u) => u._id);
      } else if (formData.recipientType === 'category') {
        if (selectedCategories.length === 0) {
          setError('Please select at least one category');
          return;
        }
        recipients.categoryIds = selectedCategories.map((c) => c._id);
      } else if (formData.recipientType === 'exam') {
        if (selectedExams.length === 0) {
          setError('Please select at least one exam');
          return;
        }
        recipients.examIds = selectedExams.map((e) => e._id);
      } else if (formData.recipientType === 'plan') {
        if (!formData.recipients.planType) {
          setError('Please select a subscription plan type');
          return;
        }
        recipients.planType = formData.recipients.planType;
      }

      // Prepare submit data - don't send recurringPattern if isRecurring is false
      const submitData: any = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        recipientType: formData.recipientType,
        recipients,
        isRecurring: formData.isRecurring,
      };

      // Only include optional fields if they have values
      if (formData.image && formData.image.trim()) {
        submitData.image = formData.image.trim();
      }
      if (formData.scheduledFor) {
        submitData.scheduledFor = new Date(formData.scheduledFor).toISOString();
      }
      // Only include recurringPattern if isRecurring is true and pattern is selected
      if (formData.isRecurring && formData.recurringPattern) {
        submitData.recurringPattern = formData.recurringPattern;
      }

      if (editingNotification) {
        await notificationApi.updateNotification(editingNotification._id, submitData);
        setSuccess('Notification updated successfully');
      } else {
        await notificationApi.createNotification(submitData);
        setSuccess('Notification created successfully');
      }

      // Close dialog after a short delay to show success message
      setTimeout(() => {
        handleCloseDialog();
        loadNotifications();
      }, 1000);
    } catch (error: any) {
      // Extract error message from response
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save notification';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setSuccess('Notification deleted successfully');
      setDeleteConfirm(null);
      loadNotifications();
    } catch (error: any) {
      setError(error.message || 'Failed to delete notification');
    }
  };

  const handleSend = async (id: string) => {
    try {
      setSending(id);
      setError('');
      setSuccess('');
      const result = await notificationApi.sendNotification(id);
      setSuccess(
        `Notification sent! Delivered: ${result.sent}, Failed: ${result.failed}`
      );
      loadNotifications();
    } catch (error: any) {
      setError(error.message || 'Failed to send notification');
    } finally {
      setSending(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'sending':
        return 'info';
      case 'failed':
        return 'error';
      case 'scheduled':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'all':
        return 'All Users';
      case 'specific':
        return 'Specific Users';
      case 'plan':
        return 'Subscription Plan';
      case 'category':
        return 'Category';
      case 'exam':
        return 'Exam';
      default:
        return type;
    }
  };

  return (
    <AdminLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Push Notifications</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Notification
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Body</TableCell>
                  <TableCell>Recipient Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Stats</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification._id}>
                      <TableCell>{notification.title}</TableCell>
                      <TableCell>
                        {notification.body.length > 50
                          ? `${notification.body.substring(0, 50)}...`
                          : notification.body}
                      </TableCell>
                      <TableCell>
                        {getRecipientTypeLabel(notification.recipientType)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={notification.status}
                          color={getStatusColor(notification.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          Sent: {notification.deliveryStats.totalSent}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Delivered: {notification.deliveryStats.totalDelivered}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Failed: {notification.deliveryStats.totalFailed}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {notification.sentAt
                          ? new Date(notification.sentAt).toLocaleString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingNotification(notification);
                            setViewDialog(true);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(notification)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {notification.status !== 'sent' && (
                          <IconButton
                            size="small"
                            onClick={() => handleSend(notification._id)}
                            disabled={sending === notification._id}
                          >
                            {sending === notification._id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <SendIcon fontSize="small" />
                            )}
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirm(notification._id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingNotification ? 'Edit Notification' : 'Create Notification'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL (Optional)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Recipient Type</InputLabel>
                  <Select
                    value={formData.recipientType}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientType: e.target.value as any })
                    }
                    label="Recipient Type"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="specific">Specific Users</MenuItem>
                    <MenuItem value="plan">Subscription Plan</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="exam">Exam</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.recipientType === 'specific' && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={users}
                    getOptionLabel={(option) => `${option.name} (${option.email})`}
                    value={selectedUsers}
                    onChange={(_, newValue) => setSelectedUsers(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Users" />
                    )}
                  />
                </Grid>
              )}

              {formData.recipientType === 'plan' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Plan Type</InputLabel>
                    <Select
                      value={formData.recipients.planType || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recipients: { ...formData.recipients, planType: e.target.value },
                        })
                      }
                      label="Plan Type"
                    >
                      <MenuItem value="free">Free</MenuItem>
                      <MenuItem value="basic">Basic</MenuItem>
                      <MenuItem value="premium">Premium</MenuItem>
                      <MenuItem value="lifetime">Lifetime</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {formData.recipientType === 'category' && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    value={selectedCategories}
                    onChange={(_, newValue) => setSelectedCategories(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Categories" />
                    )}
                  />
                </Grid>
              )}

              {formData.recipientType === 'exam' && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={exams}
                    getOptionLabel={(option) => option.name}
                    value={selectedExams}
                    onChange={(_, newValue) => setSelectedExams(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Exams" />
                    )}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Schedule For (Optional)"
                  type="datetime-local"
                  value={
                    formData.scheduledFor
                      ? new Date(formData.scheduledFor).toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduledFor: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isRecurring}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          isRecurring: newValue,
                          // Clear recurringPattern if disabling recurring
                          recurringPattern: newValue ? formData.recurringPattern : undefined,
                        });
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography>Recurring Notification (Optional)</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        <strong>One-time:</strong> Leave unchecked to send notification only once (now or scheduled time)
                        <br />
                        <strong>Recurring:</strong> Check this to automatically send notification daily, weekly, or monthly
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              {formData.isRecurring && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Recurring Pattern</InputLabel>
                    <Select
                      value={formData.recurringPattern || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, recurringPattern: e.target.value as any })
                      }
                      label="Recurring Pattern"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingNotification ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Notification Details</DialogTitle>
          <DialogContent>
            {editingNotification && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {editingNotification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {editingNotification.body}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Recipient Type:</strong>{' '}
                  {getRecipientTypeLabel(editingNotification.recipientType)}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Status:</strong> {editingNotification.status}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Sent:</strong> {editingNotification.deliveryStats.totalSent}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Delivered:</strong>{' '}
                  {editingNotification.deliveryStats.totalDelivered}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Failed:</strong> {editingNotification.deliveryStats.totalFailed}
                </Typography>
                {editingNotification.sentAt && (
                  <Typography variant="caption" display="block">
                    <strong>Sent At:</strong>{' '}
                    {new Date(editingNotification.sentAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this notification?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}


