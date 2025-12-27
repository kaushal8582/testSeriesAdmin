'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
} from '@mui/material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { analyticsApi } from '@/api/analytics.api';
import { examApi } from '@/api/exam.api';
import { testApi } from '@/api/test.api';
import { TestAnalytics, ExamAnalytics, TestAttempt, Exam, Test } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [testAnalytics, setTestAnalytics] = useState<TestAnalytics | null>(null);
  const [examAnalytics, setExamAnalytics] = useState<ExamAnalytics | null>(null);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadTests();
      loadExamAnalytics();
    }
  }, [selectedExamId]);

  useEffect(() => {
    if (selectedTestId) {
      loadTestAnalytics();
      loadTestAttempts();
    }
  }, [selectedTestId]);

  const loadExams = async () => {
    try {
      const response = await examApi.getExams({ limit: 100 });
      // Backend returns { exams: Exam[], pagination: {...} }
      const examsData = response?.exams || response?.data || [];
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (error: any) {
      console.error('Failed to load exams:', error);
      setError(error.message || 'Failed to load exams');
      setExams([]);
    }
  };

  const loadTests = async () => {
    if (!selectedExamId) return;
    try {
      const tests = await examApi.getExamTests(selectedExamId);
      const testsArray = Array.isArray(tests) ? tests : [];
      setTests(testsArray);
      if (testsArray.length > 0 && !selectedTestId) {
        setSelectedTestId(testsArray[0]?._id || '');
      }
    } catch (error: any) {
      console.error('Failed to load tests:', error);
      setError(error.message || 'Failed to load tests');
      setTests([]);
    }
  };

  const loadTestAnalytics = async () => {
    if (!selectedTestId) return;
    setLoading(true);
    try {
      const analytics = await analyticsApi.getTestAnalytics(selectedTestId);
      setTestAnalytics(analytics);
    } catch (error: any) {
      setError(error.message || 'Failed to load test analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadExamAnalytics = async () => {
    if (!selectedExamId) return;
    try {
      const analytics = await analyticsApi.getExamAnalytics(selectedExamId);
      setExamAnalytics(analytics);
    } catch (error: any) {
      console.error('Failed to load exam analytics:', error);
    }
  };

  const loadTestAttempts = async () => {
    if (!selectedTestId) return;
    try {
      const response = await analyticsApi.getTestAttempts({
        testId: selectedTestId,
        status: 'completed',
        limit: 50,
      });
      // response is PaginatedResponse<TestAttempt> which has { data: TestAttempt[], pagination: {...} }
      const attemptsData = response?.data || [];
      setTestAttempts(Array.isArray(attemptsData) ? attemptsData : []);
    } catch (error: any) {
      console.error('Failed to load test attempts:', error);
      setTestAttempts([]);
    }
  };

  const scoreDistributionData = testAnalytics
    ? Object.entries(testAnalytics.scoreDistribution).map(([range, value]) => ({
        name: range + '%',
        value,
      }))
    : [];

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Analytics & Results
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          label="Select Exam"
          value={selectedExamId}
          onChange={(e) => {
            setSelectedExamId(e.target.value);
            setSelectedTestId('');
          }}
          sx={{ minWidth: 200 }}
          >
            {exams && Array.isArray(exams) ? exams.map((exam) => (
              exam ? (
                <MenuItem key={exam._id} value={exam._id}>
                  {exam.title || 'Untitled'}
                </MenuItem>
              ) : null
            )) : null}
        </TextField>
        <TextField
          select
          label="Select Test"
          value={selectedTestId}
          onChange={(e) => setSelectedTestId(e.target.value)}
          sx={{ minWidth: 200 }}
          disabled={!selectedExamId}
        >
          {tests && Array.isArray(tests) ? tests.map((test) => (
            test ? (
              <MenuItem key={test._id} value={test._id}>
                {test.testName || 'Untitled'}
              </MenuItem>
            ) : null
          )) : null}
        </TextField>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {selectedTestId && testAnalytics && (
        <Grid container spacing={3}>
          {/* Test Analytics Overview */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Performance Overview
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Attempts: {testAnalytics?.totalAttempts || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score: {testAnalytics?.averageScore || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Highest Score: {testAnalytics?.highestScore || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lowest Score: {testAnalytics?.lowestScore || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Accuracy: {testAnalytics?.averageAccuracy || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Time: {testAnalytics?.averageTimeTaken
                    ? `${Math.floor(testAnalytics.averageTimeTaken / 60)}m ${testAnalytics.averageTimeTaken % 60}s`
                    : '0m 0s'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Score Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Score Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scoreDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scoreDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Test Attempts Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Test Attempts
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Accuracy</TableCell>
                      <TableCell>Correct</TableCell>
                      <TableCell>Wrong</TableCell>
                      <TableCell>Skipped</TableCell>
                      <TableCell>Rank</TableCell>
                      <TableCell>Submitted</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {testAttempts && Array.isArray(testAttempts) && testAttempts.length > 0 ? (
                      testAttempts.map((attempt) => (
                        attempt ? (
                          <TableRow key={attempt._id || Math.random().toString()}>
                            <TableCell>
                              {attempt.user?.name || attempt.user?.email || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              {attempt.score || 0}/{attempt.totalMarks || 0}
                            </TableCell>
                            <TableCell>{attempt.accuracy || 0}%</TableCell>
                            <TableCell>
                              <Chip label={attempt.correctAnswers || 0} color="success" size="small" />
                            </TableCell>
                            <TableCell>
                              <Chip label={attempt.wrongAnswers || 0} color="error" size="small" />
                            </TableCell>
                            <TableCell>
                              <Chip label={attempt.skippedAnswers || 0} color="warning" size="small" />
                            </TableCell>
                            <TableCell>
                              {attempt.rank ? `#${attempt.rank}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {attempt.submittedAt || attempt.startedAt
                                ? new Date(attempt.submittedAt || attempt.startedAt).toLocaleString()
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ) : null
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            No test attempts found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {selectedExamId && examAnalytics && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Exam Analytics
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Attempts: {examAnalytics?.totalAttempts || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unique Users: {examAnalytics?.uniqueUsers || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Score: {examAnalytics?.averageScore || 0}
            </Typography>
          </Box>
        </Paper>
      )}

      {!selectedTestId && (
        <Alert severity="info">Please select an exam and test to view analytics</Alert>
      )}
    </AdminLayout>
  );
}

