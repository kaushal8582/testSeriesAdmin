import React from 'react';
import { Box, Typography } from '@mui/material';
import { Book, CheckCircle } from '@mui/icons-material';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  appName?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true,
  appName = 'ExamZen'
}) => {
  const sizeMap = {
    small: 40,
    medium: 56,
    large: 80,
  };

  const fontSizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const iconSizeMap = {
    small: 20,
    medium: 32,
    large: 48,
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          position: 'relative',
          width: sizeMap[size],
          height: sizeMap[size],
          borderRadius: 2,
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 3,
          overflow: 'visible',
        }}
      >
        <Book 
          sx={{ 
            color: 'white', 
            fontSize: iconSizeMap[size],
            zIndex: 2,
          }} 
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -sizeMap[size] * 0.15,
            right: -sizeMap[size] * 0.15,
            width: sizeMap[size] * 0.5,
            height: sizeMap[size] * 0.5,
            borderRadius: '50%',
            backgroundColor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white',
            boxShadow: 2,
          }}
        >
          <CheckCircle 
            sx={{ 
              color: 'white', 
              fontSize: iconSizeMap[size] * 0.5,
            }} 
          />
        </Box>
      </Box>
      {showText && (
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: `${fontSizeMap[size]}px`,
              lineHeight: 1.2,
            }}
          >
            {appName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: `${fontSizeMap[size] * 0.4}px`,
              letterSpacing: 0.5,
            }}
          >
            Admin Panel
          </Typography>
        </Box>
      )}
    </Box>
  );
};

