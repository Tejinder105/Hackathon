import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  Waves,
  Logout,
  Settings,
  Dashboard as DashboardIcon,
  WifiOff,
  Wifi,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRealTimeAlerts, useConnectionStatus } from '../hooks/useRealTime';
import { useNotification } from '../context/NotificationContext';

const Header = ({ onNotificationClick }) => {
  const { user, logout } = useAuth();
  const { alerts, unreadCount } = useRealTimeAlerts(user?.id);
  const connectionStatus = useConnectionStatus();
  const { showSuccess } = useNotification();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    handleMenuClose();
  };

  const getRoleColor = (role) => {
    const colors = {
      'disaster_management': 'error',
      'environmental_ngo': 'success',
      'city_government': 'primary',
      'fisherfolk': 'info',
      'civil_defence': 'warning',
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'disaster_management': 'Emergency',
      'environmental_ngo': 'Environmental',
      'city_government': 'Government',
      'fisherfolk': 'Fisherfolk',
      'civil_defence': 'Civil Defence',
    };
    return labels[role] || 'General';
  };

  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Waves sx={{ fontSize: 32, color: 'primary.main' }} />
          </motion.div>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            OceanEye
          </Typography>
          <Chip
            label="BETA"
            size="small"
            color="secondary"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        </Box>

        {/* User Info and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Connection Status */}
          <Tooltip title={connectionStatus.isConnected ? 'Real-time connected' : 'Disconnected'}>
            <IconButton size="small">
              {connectionStatus.isConnected ? (
                <Wifi color="success" />
              ) : (
                <WifiOff color="error" />
              )}
            </IconButton>
          </Tooltip>

          {/* User Role */}
          {user?.role && (
            <Chip
              label={getRoleLabel(user.role)}
              color={getRoleColor(user.role)}
              size="small"
              variant="outlined"
            />
          )}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={onNotificationClick}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                }
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user?.full_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.organization}
              </Typography>
            </Box>
            <IconButton
              onClick={handleMenuClick}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                }
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '1rem'
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          {/* User Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <DashboardIcon sx={{ mr: 2 }} />
              Dashboard
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
