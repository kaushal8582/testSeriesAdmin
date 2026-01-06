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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
  Autocomplete,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { dailyChallengeApi, DailyChallenge, CreateDailyChallengeData } from '@/api/dailyChallenge.api';
import { examApi } from '@/api/exam.api';
import { testApi } from '@/api/test.api';
import { Exam } from '@/types';

export default function DailyChallengesPage() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<DailyChallenge | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [formData, setFormData] = useState<CreateDailyChallengeData>({
    date: new Date().toISOString().split('T')[0],
    challengeType: 'daily_test',
    title: '',
    description: '',
    target: 1,
    reward: { xp: 25, coins: 25 },
    examIds: [],
    isActive: true,
  });

  useEffect(() => {
    loadChallenges();
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadTests();
    } else {
      setTests([]);
    }
  }, [selectedExamId]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const challengesData = await dailyChallengeApi.getAllChallenges();
      setChallenges(Array.isArray(challengesData) ? challengesData : []);
    } catch (error: any) {
      console.error('Failed to load challenges:', error);
      setError(error.message || 'Failed to load challenges');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      const response = await examApi.getExams({ limit: 100 });
      const examsData = response?.exams || [];
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (error: any) {
      console.error('Failed to load exams:', error);
    }
  };

  const loadTests = async () => {
    if (!selectedExamId) return;
    try {
      const response = await testApi.getTests(selectedExamId, { limit: 100 });
      const testsData = response?.tests || [];
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error: any) {
      console.error('Failed to load tests:', error);
      setTests([]);
    }
  };

  const handleOpenDialog = (challenge?: DailyChallenge) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setFormData({
        date: new Date(challenge.date).toISOString().split('T')[0],
        challengeType: challenge.challengeType,
        title: challenge.title,
        description: challenge.description,
        target: challenge.target,
        targetTest: challenge.targetTest?._id,
        targetCategory: challenge.targetCategory as any,
        reward: challenge.reward,
        examIds: challenge.examIds?.map((e: any) => e._id || e) || [],
        isActive: challenge.isActive,
      });
      if (challenge.targetTest?._id) {
        // Fetch test details to get examId, then find the exam
        loadExams().then(async () => {
          try {
            const test = await testApi.getTestById(challenge.targetTest!._id);
            if (test?.examId) {
              const testExam = exams.find((e) => e._id === test.examId);
              if (testExam) {
                setSelectedExamId(testExam._id);
              }
            }
          } catch (error) {
            console.error('Failed to load test details:', error);
          }
        });
      }
    } else {
      setEditingChallenge(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        challengeType: 'daily_test',
        title: '',
        description: '',
        target: 1,
        reward: { xp: 25, coins: 25 },
        examIds: [],
        isActive: true,
      });
      setSelectedExamId('');
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingChallenge(null);
    setError('');
    setSelectedExamId('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }
      if (formData.challengeType === 'daily_test' && !formData.targetTest) {
        setError('Please select a test for daily test challenge');
        return;
      }
      if (formData.target <= 0) {
        setError('Target must be greater than 0');
        return;
      }

      if (editingChallenge) {
        await dailyChallengeApi.updateChallenge(editingChallenge._id, formData);
      } else {
        await dailyChallengeApi.createChallenge(formData);
      }
      handleCloseDialog();
      loadChallenges();
    } catch (error: any) {
      console.error('Failed to save challenge:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save challenge');
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily_test: 'Daily Test',
      accuracy: 'Accuracy',
      speed: 'Speed',
      category_focus: 'Category Focus',
      streak: 'Streak',
    };
    return labels[type] || type;
  };

  const getChallengeTypeColor = (type: string) => {
    const colors: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'error'> = {
      daily_test: 'primary',
      accuracy: 'success',
      speed: 'warning',
      category_focus: 'info',
      streak: 'error',
    };
    return colors[type] || 'default';
  };

  const handleDelete = async (challengeId: string) => {
    try {
      await dailyChallengeApi.deleteChallenge(challengeId);
      setDeleteConfirm(null);
      loadChallenges();
    } catch (error: any) {
      console.error('Failed to delete challenge:', error);
      setError(error.response?.data?.message || error.message || 'Failed to delete challenge');
      setDeleteConfirm(null);
    }
  };

  if (loading && challenges.length === 0) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Daily Challenges
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadChallenges}
              sx={{ mr: 2 }}
            >
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              Create Challenge
            </Button>
          </Box>
        </Box>

        {error && !openDialog && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Rewards</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Completions</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {challenges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No challenges found. Create your first challenge!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                challenges.map((challenge) => (
                  <TableRow key={challenge._id}>
                    <TableCell>
                      {new Date(challenge.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getChallengeTypeLabel(challenge.challengeType)}
                        color={getChallengeTypeColor(challenge.challengeType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{challenge.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {challenge.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{challenge.target}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {challenge.reward.xp} XP, {challenge.reward.coins} Coins
                      </Typography>
                    </TableCell>
                    <TableCell>{challenge.participantsCount || 0}</TableCell>
                    <TableCell>{challenge.completionsCount || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={challenge.isActive ? 'Active' : 'Inactive'}
                        color={challenge.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(challenge)}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteConfirm(challenge._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingChallenge ? 'Edit Daily Challenge' : 'Create Daily Challenge'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />

              <TextField
                label="Challenge Type"
                select
                value={formData.challengeType}
                onChange={(e) =>
                  setFormData({ ...formData, challengeType: e.target.value as any })
                }
                fullWidth
                required
              >
                <MenuItem value="daily_test">Daily Test</MenuItem>
                <MenuItem value="accuracy">Accuracy</MenuItem>
                <MenuItem value="speed">Speed</MenuItem>
                <MenuItem value="category_focus">Category Focus</MenuItem>
                <MenuItem value="streak">Streak</MenuItem>
              </TextField>

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
                required
              />

              <TextField
                label="Target"
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                fullWidth
                required
                helperText="Target value (e.g., 1 for daily test, 85 for accuracy percentage)"
              />

              {formData.challengeType === 'daily_test' && (
                <>
                  <TextField
                    label="Select Exam"
                    select
                    value={selectedExamId}
                    onChange={(e) => {
                      setSelectedExamId(e.target.value);
                      setFormData({ ...formData, targetTest: '' });
                    }}
                    fullWidth
                  >
                    <MenuItem value="">Select Exam</MenuItem>
                    {exams.map((exam) => (
                      <MenuItem key={exam._id} value={exam._id}>
                        {exam.title}
                      </MenuItem>
                    ))}
                  </TextField>

                  {selectedExamId && (
                    <TextField
                      label="Select Test"
                      select
                      value={formData.targetTest || ''}
                      onChange={(e) => setFormData({ ...formData, targetTest: e.target.value })}
                      fullWidth
                      required
                    >
                      <MenuItem value="">Select Test</MenuItem>
                      {tests.map((test) => (
                        <MenuItem key={test._id} value={test._id}>
                          {test.testName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </>
              )}

              <Box display="flex" gap={2}>
                <TextField
                  label="XP Reward"
                  type="number"
                  value={formData.reward?.xp || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reward: { ...formData.reward!, xp: Number(e.target.value) },
                    })
                  }
                  fullWidth
                />
                <TextField
                  label="Coins Reward"
                  type="number"
                  value={formData.reward?.coins || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reward: { ...formData.reward!, coins: Number(e.target.value) },
                    })
                  }
                  fullWidth
                />
              </Box>

              <Autocomplete
                multiple
                options={exams}
                getOptionLabel={(option) => option.title}
                value={exams.filter((e) => formData.examIds?.includes(e._id))}
                onChange={(_, newValue) => {
                  setFormData({
                    ...formData,
                    examIds: newValue.map((e) => e._id),
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Exam Filters (Optional)"
                    helperText="Leave empty for all exams. Select specific exams to limit challenge visibility."
                  />
                )}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingChallenge ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Delete Daily Challenge</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this daily challenge? This action cannot be undone.
              All associated user challenge progress will also be deleted.
            </Typography>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Delete Daily Challenge</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this daily challenge? This action cannot be undone.
              All associated user challenge progress will also be deleted.
            </Typography>
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

