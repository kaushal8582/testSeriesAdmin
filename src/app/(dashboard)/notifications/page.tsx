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
  Upload as UploadIcon,
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
import { testApi } from '@/api/test.api';

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
    deepLink: '',
    recipientType: 'all',
    recipients: {},
    scheduledFor: undefined,
    isRecurring: false,
    recurringPattern: undefined,
  });
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedExams, setSelectedExams] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [selectedDeepLinkScreen, setSelectedDeepLinkScreen] = useState<string>('');
  const [deepLinkParams, setDeepLinkParams] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUsers();
    loadCategories();
    loadExams();
  }, []);

  useEffect(() => {
    if ((selectedDeepLinkScreen === 'TestList' || selectedDeepLinkScreen === 'TestInstruction') && deepLinkParams.examId) {
      loadTestsForExam(deepLinkParams.examId);
    } else if (!deepLinkParams.examId) {
      setTests([]);
    }
  }, [selectedDeepLinkScreen, deepLinkParams.examId]);

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
        deepLink: notification.deepLink || '',
        recipientType: notification.recipientType,
        recipients: notification.recipients,
        scheduledFor: notification.scheduledFor,
        isRecurring: notification.isRecurring,
        recurringPattern: notification.recurringPattern,
      });
      
      // Parse deep link if exists
      let screen = '';
      let params: Record<string, string> = {};
      if (notification.deepLink) {
        const parts = notification.deepLink.split(':');
        screen = parts[0];
        for (let i = 1; i < parts.length; i += 2) {
          if (parts[i + 1]) {
            params[parts[i]] = decodeURIComponent(parts[i + 1]);
          }
        }
      }
      setSelectedDeepLinkScreen(screen);
      setDeepLinkParams(params);
      
      // Set image preview if image exists
      if (notification.image) {
        setImagePreview(notification.image);
      } else {
        setImagePreview('');
      }
      setImageFile(null);
      
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
      
      // Load tests if TestList or TestInstruction screen is selected
      if (screen === 'TestList' && params.examId) {
        loadTestsForExam(params.examId);
      } else if (screen === 'TestInstruction' && params.examId) {
        loadTestsForExam(params.examId);
      }
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        body: '',
        image: '',
        deepLink: '',
        recipientType: 'all',
        recipients: {},
        scheduledFor: undefined,
        isRecurring: false,
        recurringPattern: undefined,
      });
      setSelectedUsers([]);
      setSelectedCategories([]);
      setSelectedExams([]);
      setSelectedDeepLinkScreen('');
      setDeepLinkParams({});
      setTests([]);
      setImageFile(null);
      setImagePreview('');
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
      deepLink: '',
      recipientType: 'all',
      recipients: {},
      scheduledFor: undefined,
      isRecurring: false,
      recurringPattern: undefined,
    });
    setSelectedUsers([]);
    setSelectedCategories([]);
    setSelectedExams([]);
    setSelectedDeepLinkScreen('');
    setDeepLinkParams({});
    setTests([]);
    setImageFile(null);
    setImagePreview('');
  };

  const loadTestsForExam = async (examId: string) => {
    if (!examId) {
      setTests([]);
      return;
    }
    try {
      const response = await testApi.getTests(examId, { limit: 100 });
      setTests(response.tests || []);
    } catch (error) {
      console.error('Failed to load tests:', error);
      setTests([]);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview('');
      setFormData({ ...formData, image: '' });
    }
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) {
      return null;
    }

    try {
      setUploadingImage(true);
      // Convert file to base64 data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read image file'));
        };
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    } finally {
      setUploadingImage(false);
    }
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

      // Upload image if file is selected
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setError('Failed to upload image. Please try again.');
          return;
        }
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
      if (imageUrl && imageUrl.trim()) {
        submitData.image = imageUrl.trim();
      }
      if (formData.deepLink && formData.deepLink.trim()) {
        submitData.deepLink = formData.deepLink.trim();
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
                        <IconButton
                          size="small"
                          onClick={() => handleSend(notification._id)}
                          disabled={sending === notification._id}
                          title="Send Notification"
                        >
                          {sending === notification._id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SendIcon fontSize="small" />
                          )}
                        </IconButton>
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
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Notification Image (Optional)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="notification-image-upload"
                  type="file"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                  disabled={uploadingImage}
                />
                <label htmlFor="notification-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploadingImage}
                    sx={{ mb: 1 }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Select Image from Device'}
                  </Button>
                </label>
                {imagePreview && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <img
                      src={imagePreview}
                      alt="Notification preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        handleImageChange(null);
                        setFormData({ ...formData, image: '' });
                      }}
                      sx={{ mt: 1 }}
                    >
                      Remove Image
                    </Button>
                  </Box>
                )}
                {!imagePreview && formData.image && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                      Current Image URL:
                    </Typography>
                    <img
                      src={formData.image}
                      alt="Current notification image"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      onError={() => {
                        // If image fails to load, clear it
                        setFormData({ ...formData, image: '' });
                      }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Or enter image URL manually"
                      sx={{ mt: 1 }}
                      helperText="You can also enter image URL directly"
                    />
                  </Box>
                )}
                {!imagePreview && !formData.image && (
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Or enter image URL manually"
                    sx={{ mt: 1 }}
                    helperText="Select image from device or enter image URL"
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Deep Link Screen (Optional)</InputLabel>
                  <Select
                    value={selectedDeepLinkScreen}
                    onChange={(e) => {
                      const screen = e.target.value;
                      setSelectedDeepLinkScreen(screen);
                      // Reset params when screen changes
                      setDeepLinkParams({});
                      // Build deep link string
                      if (screen) {
                        setFormData({ ...formData, deepLink: screen });
                      } else {
                        setFormData({ ...formData, deepLink: '' });
                      }
                    }}
                    label="Deep Link Screen (Optional)"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="Home">Home</MenuItem>
                    <MenuItem value="Profile">Profile</MenuItem>
                    <MenuItem value="Categories">Categories</MenuItem>
                    <MenuItem value="Performance">Performance</MenuItem>
                    <MenuItem value="QuizRoomHistory">Quiz Room History</MenuItem>
                    <MenuItem value="Leaderboard">Leaderboard</MenuItem>
                    <MenuItem value="SubscriptionPlans">Subscription Plans</MenuItem>
                    <MenuItem value="TransactionHistory">Transaction History</MenuItem>
                    <MenuItem value="TestAttemptHistory">Test Attempt History</MenuItem>
                    <MenuItem value="CreateQuizRoom">Create Quiz Room</MenuItem>
                    <MenuItem value="JoinQuizRoom">Join Quiz Room</MenuItem>
                    <MenuItem value="ExamList">Exam List</MenuItem>
                    <MenuItem value="TestList">Test List</MenuItem>
                    <MenuItem value="TestInstruction">Test Instruction</MenuItem>
                    <MenuItem value="Result">Result</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Dynamic parameter fields based on selected screen */}
              {selectedDeepLinkScreen === 'ExamList' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Category (Optional)</InputLabel>
                    <Select
                      value={deepLinkParams.category || ''}
                      onChange={(e) => {
                        const category = e.target.value;
                        const newParams = { ...deepLinkParams, category };
                        setDeepLinkParams(newParams);
                        const paramString = category ? `:category:${category}` : '';
                        setFormData({ ...formData, deepLink: `ExamList${paramString}` });
                      }}
                      label="Category (Optional)"
                    >
                      <MenuItem value="">None</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {selectedDeepLinkScreen === 'TestList' && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Exam *</InputLabel>
                      <Select
                        value={deepLinkParams.examId || ''}
                        onChange={(e) => {
                          const examId = e.target.value;
                          const newParams = { ...deepLinkParams, examId };
                          setDeepLinkParams(newParams);
                          const exam = exams.find((e) => e._id === examId);
                          const examTitle = exam?.title || '';
                          setFormData({ 
                            ...formData, 
                            deepLink: `TestList:examId:${examId}:examTitle:${encodeURIComponent(examTitle)}` 
                          });
                          if (examId) {
                            loadTestsForExam(examId);
                          }
                        }}
                        label="Exam *"
                        required
                      >
                        <MenuItem value="">Select Exam</MenuItem>
                        {exams.map((exam) => (
                          <MenuItem key={exam._id} value={exam._id}>
                            {exam.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {selectedDeepLinkScreen === 'TestInstruction' && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Exam *</InputLabel>
                      <Select
                        value={deepLinkParams.examId || ''}
                        onChange={(e) => {
                          const examId = e.target.value;
                          const newParams: Record<string, string> = { ...deepLinkParams, examId };
                          delete newParams.testId; // Reset test when exam changes
                          setDeepLinkParams(newParams);
                          if (examId) {
                            loadTestsForExam(examId);
                          } else {
                            setTests([]);
                          }
                        }}
                        label="Exam *"
                        required
                      >
                        <MenuItem value="">Select Exam</MenuItem>
                        {exams.map((exam) => (
                          <MenuItem key={exam._id} value={exam._id}>
                            {exam.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {deepLinkParams.examId && (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Test *</InputLabel>
                        <Select
                          value={deepLinkParams.testId || ''}
                          onChange={(e) => {
                            const testId = e.target.value;
                            const newParams = { ...deepLinkParams, testId };
                            setDeepLinkParams(newParams);
                            setFormData({ ...formData, deepLink: `TestInstruction:testId:${testId}` });
                          }}
                          label="Test *"
                          required
                        >
                          <MenuItem value="">Select Test</MenuItem>
                          {tests.map((test) => (
                            <MenuItem key={test._id} value={test._id}>
                              {test.testName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </>
              )}

              {selectedDeepLinkScreen === 'Result' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Attempt ID *"
                    value={deepLinkParams.attemptId || ''}
                    onChange={(e) => {
                      const attemptId = e.target.value;
                      const newParams = { ...deepLinkParams, attemptId };
                      setDeepLinkParams(newParams);
                      setFormData({ ...formData, deepLink: `Result:attemptId:${attemptId}` });
                    }}
                    required
                    helperText="Enter the test attempt ID"
                  />
                </Grid>
              )}

              {selectedDeepLinkScreen === 'QuizRoomLobby' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Room Code *"
                    value={deepLinkParams.roomCode || ''}
                    onChange={(e) => {
                      const roomCode = e.target.value;
                      const newParams = { ...deepLinkParams, roomCode };
                      setDeepLinkParams(newParams);
                      setFormData({ ...formData, deepLink: `QuizRoomLobby:roomCode:${roomCode}` });
                    }}
                    required
                    helperText="Enter the quiz room code"
                  />
                </Grid>
              )}

              {selectedDeepLinkScreen === 'QuizRoomPlayer' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Room Code *"
                    value={deepLinkParams.roomCode || ''}
                    onChange={(e) => {
                      const roomCode = e.target.value;
                      const newParams = { ...deepLinkParams, roomCode };
                      setDeepLinkParams(newParams);
                      setFormData({ ...formData, deepLink: `QuizRoomPlayer:roomCode:${roomCode}` });
                    }}
                    required
                    helperText="Enter the quiz room code"
                  />
                </Grid>
              )}

              {selectedDeepLinkScreen === 'QuizRoomResults' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Room Code *"
                    value={deepLinkParams.roomCode || ''}
                    onChange={(e) => {
                      const roomCode = e.target.value;
                      const newParams = { ...deepLinkParams, roomCode };
                      setDeepLinkParams(newParams);
                      setFormData({ ...formData, deepLink: `QuizRoomResults:roomCode:${roomCode}` });
                    }}
                    required
                    helperText="Enter the quiz room code"
                  />
                </Grid>
              )}

              {selectedDeepLinkScreen === 'TransactionHistory' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Type (Optional)</InputLabel>
                    <Select
                      value={deepLinkParams.type || ''}
                      onChange={(e) => {
                        const type = e.target.value;
                        const newParams = { ...deepLinkParams, type };
                        setDeepLinkParams(newParams);
                        const paramString = type ? `:type:${type}` : '';
                        setFormData({ ...formData, deepLink: `TransactionHistory${paramString}` });
                      }}
                      label="Type (Optional)"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="xp">XP</MenuItem>
                      <MenuItem value="coins">Coins</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {selectedDeepLinkScreen === 'Payment' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Plan ID *"
                    value={deepLinkParams.planId || ''}
                    onChange={(e) => {
                      const planId = e.target.value;
                      const newParams = { ...deepLinkParams, planId };
                      setDeepLinkParams(newParams);
                      setFormData({ ...formData, deepLink: `Payment:planId:${planId}` });
                    }}
                    required
                    helperText="Enter the subscription plan ID"
                  />
                </Grid>
              )}
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
                    getOptionLabel={(option) => option.title}
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


