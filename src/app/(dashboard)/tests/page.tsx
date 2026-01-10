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
import { testApi } from '@/api/test.api';
import { examApi } from '@/api/exam.api';
import { tabApi, Tab } from '@/api/tab.api';
import { Test, CreateTestData, Exam } from '@/types';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateTestData>({
    testName: '',
    examId: '',
    tabId: '',
    totalQuestions: 0,
    totalMarks: 0,
    duration: 0,
    isFree: false,
    isActive: true,
    order: 1,
    description: '',
    instructions: '',
  });

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadTests();
      loadTabs();
    } else {
      setTests([]);
      setTabs([]);
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      const response = await examApi.getExams({ limit: 100 });
      // Backend returns { exams: Exam[], pagination: {...} }
      const examsData = response?.exams || [];
      const examsArray = Array.isArray(examsData) ? examsData : [];
      setExams(examsArray);
      if (examsArray.length > 0 && !selectedExamId) {
        setSelectedExamId(examsArray[0]?._id || '');
      }
    } catch (error: any) {
      console.error('Failed to load exams:', error);
      setError(error.message || 'Failed to load exams');
      setExams([]);
    }
  };

  const loadTests = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      // Include inactive tests for admin panel so they can see and edit all tests
      const response = await testApi.getTests(selectedExamId, { limit: 100, includeInactive: true });
      // Backend returns { tests: Test[], pagination: {...} }
      const testsData = response?.tests || [];
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error: any) {
      console.error('Failed to load tests:', error);
      setError(error.message || 'Failed to load tests');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTabs = async () => {
    if (!selectedExamId) return;
    try {
      const tabsData = await tabApi.getTabs(selectedExamId);
      setTabs(Array.isArray(tabsData) ? tabsData : []);
    } catch (error: any) {
      console.error('Failed to load tabs:', error);
      setTabs([]);
    }
  };

  const handleOpenDialog = (test?: Test) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        testName: test.testName,
        examId: test.examId,
        tabId: (test as any).tabId || '',
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        duration: test.duration,
        isFree: test.isFree,
        isActive: test.isActive !== undefined ? test.isActive : true,
        order: test.order,
        description: test.description || '',
        instructions: test.instructions || '',
      });
    } else {
      setEditingTest(null);
      const defaultTab = tabs.find(tab => tab.isDefault);
      setFormData({
        testName: '',
        examId: selectedExamId,
        tabId: defaultTab?._id || '',
        totalQuestions: 1,
        totalMarks: 1,
        duration: 30,
        isFree: false,
        isActive: true,
        order: (tests && Array.isArray(tests) ? tests.length : 0) + 1,
        description: '',
        instructions: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTest(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      // Validate required fields
      if (!formData.testName.trim()) {
        setError('Test name is required');
        return;
      }
      if (!formData.examId) {
        setError('Please select an exam');
        return;
      }
      if (formData.totalQuestions < 1) {
        setError('Total questions must be at least 1');
        return;
      }
      if (formData.totalMarks < 1) {
        setError('Total marks must be at least 1');
        return;
      }
      if (formData.duration < 1) {
        setError('Duration must be at least 1 minute');
        return;
      }
      
      if (editingTest) {
        await testApi.updateTest(editingTest._id, formData);
      } else {
        await testApi.createTest(formData);
      }
      handleCloseDialog();
      loadTests();
      // Reload exams to update totalTests count
      loadExams();
    } catch (error: any) {
      setError(error.message || 'Failed to save test');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await testApi.deleteTest(id);
      setDeleteConfirm(null);
      loadTests();
    } catch (error: any) {
      setError(error.message || 'Failed to delete test');
    }
  };

  if (loading && !tests.length) {
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
              Tests Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage tests for exams
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              label="Select Exam"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              sx={{ minWidth: 250 }}
              size="small"
            >
              {exams && Array.isArray(exams) ? exams.map((exam) => (
                exam ? (
                  <MenuItem key={exam._id} value={exam._id}>
                    {exam.title || 'Untitled'}
                  </MenuItem>
                ) : null
              )) : null}
            </TextField>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={!selectedExamId}
              sx={{ 
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
              }}
            >
              Create Test
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!selectedExamId && exams.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select an exam from the dropdown above to view and create tests.
        </Alert>
      )}

      {!selectedExamId && exams.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No exams found. Please create an exam first before creating tests.
        </Alert>
      )}

      {selectedExamId ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tests ({tests?.length || 0})
            </Typography>
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
              Create Test
            </Button>
          </Box>
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
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Order</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Test Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Questions</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Marks</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Free</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tests && Array.isArray(tests) && tests.length > 0 ? (
                tests.map((test) => (
                  test ? (
                    <TableRow 
                      key={test._id || Math.random().toString()}
                      sx={{ 
                        '&:hover': { backgroundColor: 'action.hover' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{test.order || 0}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{test.testName || 'N/A'}</TableCell>
                      <TableCell>{test.totalQuestions || 0}</TableCell>
                      <TableCell>{test.duration || 0} min</TableCell>
                      <TableCell>{test.totalMarks || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={test.isFree ? 'Free' : 'Paid'}
                          color={test.isFree ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={test.isActive !== false ? 'Visible' : 'Hidden'}
                          color={test.isActive !== false ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          onClick={() => test && handleOpenDialog(test)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => test?._id && setDeleteConfirm(test._id)} 
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ) : null
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        No tests found. Create your first test for this exam.
                      </Typography>
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
                        }}
                      >
                        Create First Test
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>
      ) : (
        <Alert severity="info">Please select an exam to view tests</Alert>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingTest ? 'Edit Test' : 'Create Test'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Test Name"
              value={formData.testName}
              onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
              fullWidth
              required
            />
            {tabs.length > 0 && (
              <TextField
                select
                label="Tab"
                value={formData.tabId || ''}
                onChange={(e) => setFormData({ ...formData, tabId: e.target.value })}
                fullWidth
                helperText="Select the tab this test belongs to"
              >
                <MenuItem value="">None (All Tabs)</MenuItem>
                {tabs.map((tab) => (
                  <MenuItem key={tab._id} value={tab._id}>
                    {tab.name} {tab.isDefault && '(Default)'}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Total Questions"
              type="number"
              value={formData.totalQuestions}
              onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Total Marks"
              type="number"
              value={formData.totalMarks}
              onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isFree}
                  onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                />
              }
              label="Free Test"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive !== undefined ? formData.isActive : true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label="Visible in App"
              sx={{ mt: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: -1, mb: 1 }}>
              {formData.isActive !== false ? 'Test will be visible to users in the app' : 'Test will be hidden from users in the app'}
            </Typography>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTest ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this test? This action cannot be undone.</Typography>
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

