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
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { examApi } from '@/api/exam.api';
import { categoryApi, Category } from '@/api/category.api';
import { tabApi, Tab, CreateTabData } from '@/api/tab.api';
import { Exam, CreateExamData } from '@/types';
import { EXAM_LANGUAGES, EXAM_STATUS } from '@/constants';
import { useRouter } from 'next/navigation';
import { FormControlLabel, Checkbox } from '@mui/material';

export default function ExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [openTabsDialog, setOpenTabsDialog] = useState(false);
  const [openTabFormDialog, setOpenTabFormDialog] = useState(false);
  const [selectedExamForTabs, setSelectedExamForTabs] = useState<Exam | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  const [tabFormData, setTabFormData] = useState<CreateTabData>({
    name: '',
    examId: '',
    order: 1,
    isDefault: false,
    description: '',
  });
  const [formData, setFormData] = useState<CreateExamData>({
    title: '',
    description: '',
    category: '',
    language: '',
    totalMarks: 0,
    duration: 0,
    status: 'draft',
  });

  useEffect(() => {
    loadExams();
    loadCategories();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      // For admin, don't pass status filter - backend will show all exams (draft + published)
      const response = await examApi.getExams({ limit: 100 });
      // Backend returns { exams: Exam[], pagination: {...} }
      // response.data is { exams: [...], pagination: {...} }
      const examsData = response?.exams || response?.data || [];
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (error: any) {
      console.error('Failed to load exams:', error);
      setError(error.message || 'Failed to load exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryApi.getCategories({ isActive: true });
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleOpenDialog = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        title: exam.title,
        description: exam.description || '',
        category: exam.category,
        language: exam.language,
        totalMarks: exam.totalMarks,
        duration: exam.duration,
        status: exam.status,
      });
    } else {
      setEditingExam(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        language: '',
        totalMarks: 0,
        duration: 0,
        status: 'draft',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExam(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingExam) {
        await examApi.updateExam(editingExam._id, formData);
      } else {
        await examApi.createExam(formData);
      }
      handleCloseDialog();
      loadExams();
    } catch (error: any) {
      setError(error.message || 'Failed to save exam');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await examApi.deleteExam(id);
      setDeleteConfirm(null);
      loadExams();
    } catch (error: any) {
      setError(error.message || 'Failed to delete exam');
    }
  };

  const handleToggleStatus = async (exam: Exam) => {
    try {
      const newStatus = exam.status === 'published' ? 'draft' : 'published';
      await examApi.updateExam(exam._id, { status: newStatus });
      loadExams();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    }
  };

  const handleOpenTabsDialog = async (exam: Exam) => {
    setSelectedExamForTabs(exam);
    setOpenTabsDialog(true);
    setError('');
    await loadTabs(exam._id);
  };

  const handleCloseTabsDialog = () => {
    setOpenTabsDialog(false);
    setSelectedExamForTabs(null);
    setTabs([]);
    setEditingTab(null);
    setError('');
  };

  const loadTabs = async (examId: string) => {
    try {
      setError('');
      const tabsData = await tabApi.getTabs(examId);
      console.log('Loaded tabs for exam:', examId, tabsData);
      setTabs(Array.isArray(tabsData) ? tabsData : []);
    } catch (error: any) {
      console.error('Failed to load tabs:', error);
      setError(error.message || 'Failed to load tabs');
      setTabs([]);
    }
  };

  const handleOpenTabDialog = (tab?: Tab) => {
    if (tab) {
      setEditingTab(tab);
      setTabFormData({
        name: tab.name,
        examId: tab.examId,
        order: tab.order,
        isDefault: tab.isDefault,
        description: tab.description || '',
      });
    } else {
      setEditingTab(null);
      setTabFormData({
        name: '',
        examId: selectedExamForTabs?._id || '',
        order: tabs.length + 1,
        isDefault: false,
        description: '',
      });
    }
    setOpenTabFormDialog(true);
  };

  const handleCloseTabDialog = () => {
    setOpenTabFormDialog(false);
    setEditingTab(null);
    setTabFormData({
      name: '',
      examId: selectedExamForTabs?._id || '',
      order: 1,
      isDefault: false,
      description: '',
    });
  };

  const handleSubmitTab = async () => {
    try {
      setError('');
      if (editingTab) {
        await tabApi.updateTab(editingTab._id, tabFormData);
      } else {
        await tabApi.createTab(tabFormData);
      }
      handleCloseTabDialog();
      if (selectedExamForTabs) {
        await loadTabs(selectedExamForTabs._id);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save tab');
    }
  };

  const handleDeleteTab = async (id: string) => {
    try {
      await tabApi.deleteTab(id);
      if (selectedExamForTabs) {
        await loadTabs(selectedExamForTabs._id);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete tab');
    }
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
              Exams Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage exam categories
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
            Create Exam
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: 2,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Language</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total Marks</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tests</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams && Array.isArray(exams) && exams.length > 0 ? (
              exams.map((exam) => (
                exam ? (
                  <TableRow 
                    key={exam._id || Math.random().toString()}
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{exam.title || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={exam.category || 'N/A'} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>{exam.language || 'N/A'}</TableCell>
                    <TableCell>{exam.duration || 0} min</TableCell>
                    <TableCell>{exam.totalMarks || 0}</TableCell>
                    <TableCell>{exam.totalTests || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={exam.status || 'draft'}
                        color={exam.status === 'published' ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Tooltip title="Manage Tabs">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewListIcon />}
                            onClick={() => exam && handleOpenTabsDialog(exam)}
                            sx={{ 
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              minWidth: 'auto',
                              px: 1,
                            }}
                          >
                            Tabs
                          </Button>
                        </Tooltip>
                        <Tooltip title={exam.status === 'published' ? 'Unpublish' : 'Publish'}>
                          <IconButton
                            size="small"
                            onClick={() => exam && handleToggleStatus(exam)}
                            sx={{ color: exam.status === 'published' ? 'success.main' : 'text.secondary' }}
                          >
                            {exam.status === 'published' ? <UnpublishedIcon fontSize="small" /> : <PublishIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => exam && handleOpenDialog(exam)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => exam?._id && setDeleteConfirm(exam._id)} 
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : null
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No exams found. Create your first exam to get started.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {editingExam ? 'Edit Exam' : 'Create New Exam'}
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
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
              required
              disabled={categories.length === 0}
              helperText={categories.length === 0 ? 'No categories available. Please create categories first.' : ''}
            >
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No categories available
                </MenuItem>
              )}
            </TextField>
            <TextField
              select
              label="Language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              fullWidth
              required
            >
              {EXAM_LANGUAGES.map((lang) => (
                <MenuItem key={lang.value} value={lang.value}>
                  {lang.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Total Marks"
              type="number"
              value={formData.totalMarks || 0}
              onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) || 0 })}
              fullWidth
              required
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration || 0}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              fullWidth
              required
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              fullWidth
              required
            >
              {EXAM_STATUS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{ 
              textTransform: 'none', 
              px: 3,
              fontWeight: 600,
            }}
          >
            {editingExam ? 'Update Exam' : 'Create Exam'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this exam? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tabs Management Dialog */}
      <Dialog 
        open={openTabsDialog} 
        onClose={handleCloseTabsDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Manage Tabs - {selectedExamForTabs?.title}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTabDialog()}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Add Tab
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Order</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Default</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tabs.length > 0 ? (
                  tabs.map((tab) => (
                    <TableRow key={tab._id}>
                      <TableCell>{tab.name}</TableCell>
                      <TableCell align="center">{tab.order}</TableCell>
                      <TableCell align="center">
                        {tab.isDefault && <Chip label="Default" size="small" color="primary" />}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenTabDialog(tab)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTab(tab._id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No tabs found. Click "Add Tab" to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseTabsDialog} sx={{ textTransform: 'none', px: 3 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Tab Dialog */}
      <Dialog 
        open={openTabFormDialog} 
        onClose={handleCloseTabDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingTab ? 'Edit Tab' : 'Create New Tab'}
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
              label="Tab Name"
              value={tabFormData.name}
              onChange={(e) => setTabFormData({ ...tabFormData, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Math, GK/GS, Hindi, English, PYQ"
            />
            <TextField
              label="Order"
              type="number"
              value={tabFormData.order}
              onChange={(e) => setTabFormData({ ...tabFormData, order: parseInt(e.target.value) || 1 })}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Description"
              value={tabFormData.description}
              onChange={(e) => setTabFormData({ ...tabFormData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={tabFormData.isDefault}
                  onChange={(e) => setTabFormData({ ...tabFormData, isDefault: e.target.checked })}
                />
              }
              label="Set as Default Tab"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseTabDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitTab} 
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {editingTab ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

