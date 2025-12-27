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
  CircularProgress,
  Alert,
  Typography,
  Chip,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Computer as ComputerIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { userApi, User } from '@/api/user.api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [page, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active';

      const response = await userApi.getUsers(params);
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      setError(error.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const user = await userApi.getUserById(userId);
      setSelectedUser(user);
      setViewDialog(true);
      setTabValue(0);
    } catch (error: any) {
      setError(error.message || 'Failed to load user details');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      await userApi.updateUserRole(userId, newRole);
      setRoleDialog(false);
      loadUsers();
    } catch (error: any) {
      setError(error.message || 'Failed to update user role');
    }
  };

  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    try {
      await userApi.updateUserStatus(userId, isActive);
      loadUsers();
    } catch (error: any) {
      setError(error.message || 'Failed to update user status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userApi.deleteUser(id);
      setDeleteConfirm(null);
      loadUsers();
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            User Management
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Users"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="ADMIN">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={loadUsers}
                size="small"
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tests</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Last Login</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'ADMIN' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.totalTestsCompleted || 0}</TableCell>
                    <TableCell>
                      {user.trackingInfo?.lastLoginAt
                        ? formatDate(user.trackingInfo.lastLoginAt)
                        : 'Never'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewUser(user._id)}
                        sx={{ color: 'primary.main' }}
                      >
                        <ViewIcon />
                      </IconButton>
                      {user.role !== 'ADMIN' && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleDialog(true);
                          }}
                          sx={{ color: 'warning.main' }}
                        >
                          <AdminIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateStatus(user._id, !user.isActive)}
                        sx={{ color: user.isActive ? 'error.main' : 'success.main' }}
                      >
                        {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteConfirm(user._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No users found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              variant="outlined"
            >
              Previous
            </Button>
            <Typography sx={{ alignSelf: 'center', px: 2 }}>
              Page {page} of {totalPages}
            </Typography>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              variant="outlined"
            >
              Next
            </Button>
          </Box>
        )}

        {/* View User Dialog */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedUser?.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedUser?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser?.email}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
              <Tab label="Basic Info" />
              <Tab label="Tracking Info" />
              <Tab label="Login History" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{selectedUser?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedUser?.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedUser?.phone || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  <Chip
                    label={selectedUser?.role}
                    color={selectedUser?.role === 'ADMIN' ? 'primary' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedUser?.isActive ? 'Active' : 'Inactive'}
                    color={selectedUser?.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Tests Completed</Typography>
                  <Typography variant="body1">{selectedUser?.totalTestsCompleted || 0}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Average Score</Typography>
                  <Typography variant="body1">{selectedUser?.averageScore?.toFixed(2) || '0.00'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Joined</Typography>
                  <Typography variant="body1">{formatDate(selectedUser?.createdAt)}</Typography>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {selectedUser?.trackingInfo ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon fontSize="small" />
                          Location Information
                        </Typography>
                        <Typography variant="body2">
                          <strong>Country:</strong> {selectedUser.trackingInfo.location?.country || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Region:</strong> {selectedUser.trackingInfo.location?.region || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>City:</strong> {selectedUser.trackingInfo.location?.city || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Timezone:</strong> {selectedUser.trackingInfo.location?.timezone || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ComputerIcon fontSize="small" />
                          Device Information
                        </Typography>
                        <Typography variant="body2">
                          <strong>Platform:</strong> {selectedUser.trackingInfo.deviceInfo?.platform || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Device Type:</strong> {selectedUser.trackingInfo.deviceInfo?.deviceType || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>OS:</strong> {selectedUser.trackingInfo.deviceInfo?.os || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Browser:</strong> {selectedUser.trackingInfo.deviceInfo?.browser || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                          <strong>User Agent:</strong> {selectedUser.trackingInfo.deviceInfo?.userAgent || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" />
                          Activity Information
                        </Typography>
                        <Typography variant="body2">
                          <strong>Last Login:</strong> {formatDate(selectedUser.trackingInfo.lastLoginAt)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Last Activity:</strong> {formatDate(selectedUser.trackingInfo.lastActivityAt)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Last Login IP:</strong> {selectedUser.trackingInfo.lastLoginIp || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>App Platform:</strong> {selectedUser.trackingInfo.appPlatform || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>App Version:</strong> {selectedUser.trackingInfo.appVersion || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  {selectedUser.trackingInfo.ipAddresses && selectedUser.trackingInfo.ipAddresses.length > 0 && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            IP Addresses Used
                          </Typography>
                          {selectedUser.trackingInfo.ipAddresses.map((ip, index) => (
                            <Typography key={index} variant="body2">
                              {ip.ip} - {formatDate(ip.timestamp)}
                            </Typography>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography color="text.secondary">No tracking information available</Typography>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              {selectedUser?.trackingInfo?.loginHistory && selectedUser.trackingInfo.loginHistory.length > 0 ? (
                <Box>
                  {selectedUser.trackingInfo.loginHistory.slice(0, 10).map((login, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="body2">
                          <strong>IP Address:</strong> {login.ipAddress}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Device:</strong> {login.deviceType}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Location:</strong>{' '}
                          {[login.location?.city, login.location?.region, login.location?.country]
                            .filter(Boolean)
                            .join(', ') || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Time:</strong> {formatDate(login.timestamp)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No login history available</Typography>
              )}
            </TabPanel>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Role Update Dialog */}
        <Dialog open={roleDialog} onClose={() => setRoleDialog(false)}>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Make <strong>{selectedUser?.name}</strong> an Admin?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admins can access the admin panel and manage all content.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialog(false)}>Cancel</Button>
            <Button
              onClick={() => selectedUser && handleUpdateRole(selectedUser._id, 'ADMIN')}
              variant="contained"
              color="primary"
            >
              Make Admin
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this user? This action cannot be undone.
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

