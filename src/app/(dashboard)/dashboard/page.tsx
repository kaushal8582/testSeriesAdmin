'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  People as PeopleIcon,
  MenuBook as ExamIcon,
  Quiz as TestIcon,
  HelpOutline as QuestionIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { examApi } from '@/api/exam.api';
import { testApi } from '@/api/test.api';
import { questionApi } from '@/api/question.api';
import { DashboardStats } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box sx={{ color, fontSize: 48 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Fetch all data in parallel
      const [examsData, testsData, questionsData] = await Promise.all([
        examApi.getExams({ limit: 1 }),
        testApi.getTests('', { limit: 1 }),
        questionApi.getQuestions('', { limit: 1 }),
      ]);

      // Get user count from API (you may need to add this endpoint)
      const totalUsers = 0; // Placeholder - add API call when available

      setStats({
        totalUsers,
        totalExams: examsData?.pagination?.total || 0,
        totalTests: testsData?.pagination?.total || 0,
        totalQuestions: questionsData?.pagination?.total || 0,
        recentActivity: [],
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats({
        totalUsers: 0,
        totalExams: 0,
        totalTests: 0,
        totalQuestions: 0,
        recentActivity: [],
      });
    } finally {
      setLoading(false);
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

  const chartData = stats
    ? [
        { name: 'Users', value: stats.totalUsers || 0 },
        { name: 'Exams', value: stats.totalExams || 0 },
        { name: 'Tests', value: stats.totalTests || 0 },
        { name: 'Questions', value: stats.totalQuestions || 0 },
      ]
    : [];

  return (
    <AdminLayout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Exams"
            value={stats?.totalExams || 0}
            icon={<ExamIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tests"
            value={stats?.totalTests || 0}
            icon={<TestIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Questions"
            value={stats?.totalQuestions || 0}
            icon={<QuestionIcon />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overview Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Add quick action buttons here */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}

