'use client';

import React from 'react';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import { Sidebar } from './Sidebar';
import { getUserData } from '@/utils/cookies';

const drawerWidth = 240;

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getUserData();

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            bgcolor: 'white',
            color: 'text.primary',
            boxShadow: 1,
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Welcome, {user?.name || 'Admin'}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Box >{children}</Box>
      </Box>
    </Box>
  );
};

