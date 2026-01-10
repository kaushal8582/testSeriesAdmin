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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { FormControlLabel, Switch } from '@mui/material';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { categoryApi, Category, CreateCategoryData } from '@/api/category.api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateCategoryData & { isActive?: boolean }>({
    name: '',
    description: '',
    icon: '',
    color: '#4A90E2',
    order: 0,
    isActive: true,
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryApi.getCategories({ includeInactive: true });
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      setError(error.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        color: category.color || '#4A90E2',
        order: category.order || 0,
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
      setIconPreview(category.icon || null);
      setIconFile(null);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
        color: '#4A90E2',
        order: categories.length,
        isActive: true,
      });
      setIconPreview(null);
      setIconFile(null);
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setError('');
    setIconFile(null);
    setIconPreview(null);
  };

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIconFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (!formData.name.trim()) {
        setError('Category name is required');
        return;
      }

      // If icon file is selected, use FormData
      if (iconFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('color', formData.color || '#4A90E2');
        formDataToSend.append('order', String(formData.order || 0));
        formDataToSend.append('isActive', String(formData.isActive !== undefined ? formData.isActive : true));
        formDataToSend.append('icon', iconFile);

        if (editingCategory) {
          await categoryApi.updateCategory(editingCategory._id, formDataToSend);
        } else {
          await categoryApi.createCategory(formDataToSend);
        }
      } else {
        // No file, use regular JSON
        const dataToSend = {
          ...formData,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
        };
        if (editingCategory) {
          await categoryApi.updateCategory(editingCategory._id, dataToSend);
        } else {
          await categoryApi.createCategory(dataToSend);
        }
      }
      handleCloseDialog();
      setTimeout(() => {
        loadCategories();
      }, 500);
    } catch (error: any) {
      console.error('Error saving category:', error);
      setError(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryApi.deleteCategory(id);
      setDeleteConfirm(null);
      loadCategories();
    } catch (error: any) {
      setError(error.message || 'Failed to delete category');
      setDeleteConfirm(null);
    }
  };

  if (loading && categories.length === 0) {
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
            Categories
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
            Add Category
          </Button>
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Icon</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Order</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories && Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow
                    key={category._id}
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      {category.icon ? (
                        <Avatar
                          src={category.icon}
                          alt={category.name}
                          sx={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <Avatar sx={{ width: 40, height: 40, bgcolor: category.color || '#4A90E2' }}>
                          {category.name.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{category.name}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap>
                        {category.description || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{category.order}</TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Active' : 'Inactive'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(category)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteConfirm(category._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        No categories found. Create your first category.
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
                        Add First Category
                      </Button>
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
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="e.g., SSC, Banking, Railway"
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                placeholder="Optional description"
              />
              
              {/* Icon Upload Section */}
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Category Icon
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {iconPreview ? (
                    <Avatar src={iconPreview} alt="Icon preview" sx={{ width: 80, height: 80 }} />
                  ) : formData.icon ? (
                    <Avatar src={formData.icon} alt="Current icon" sx={{ width: 80, height: 80 }} />
                  ) : (
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.300' }}>
                      <ImageIcon sx={{ fontSize: 40, color: 'grey.600' }} />
                    </Avatar>
                  )}
                  <Box>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="icon-upload-button"
                      type="file"
                      onChange={handleIconChange}
                    />
                    <label htmlFor="icon-upload-button">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        {iconFile ? 'Change Icon' : 'Upload Icon'}
                      </Button>
                    </label>
                    {iconFile && (
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        {iconFile.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <TextField
                  label="Or Enter Icon URL"
                  value={formData.icon}
                  onChange={(e) => {
                    setFormData({ ...formData, icon: e.target.value });
                    setIconPreview(e.target.value || null);
                    setIconFile(null);
                  }}
                  fullWidth
                  size="small"
                  placeholder="https://example.com/icon.png"
                  helperText="Leave empty if uploading file above"
                />
              </Box>
              <TextField
                label="Order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive !== undefined ? formData.isActive : true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active Status"
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: -1, mb: 1 }}>
                {formData.isActive ? 'Category will be visible to users' : 'Category will be hidden from users'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', px: 3 }}>
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
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this category? This action cannot be undone.
              If this category is being used by exams, deletion will fail.
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

