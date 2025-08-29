import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Close,
  Warning,
  Info,
  CheckCircle,
  Error,
  Waves,
  LocationOn,
  Schedule,
  MarkEmailRead,
  ClearAll,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useRealTimeAlerts } from '../hooks/useRealTime';
import { alertService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const NOTIFICATION_WIDTH = 400;

const NotificationPanel = ({ open, onClose }) => {
  const { user } = useAuth();
  const { alerts, unreadCount, markAsRead, markAllAsRead, setAlerts } = useRealTimeAlerts(user?.id);
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Load alerts on mount
  useEffect(() => {
    if (open && user?.id) {
      loadAlerts();
    }
  }, [open, user?.id]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertService.getAlerts({
        user_id: user.id,
        limit: 50
      });
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
      showError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await alertService.markAsRead(alertId);
      markAsRead(alertId);
      showSuccess('Alert marked as read');
    } catch (error) {
      console.error('Error marking alert as read:', error);
      showError('Failed to mark alert as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(alert => alert.status === 'sent');
      if (unreadAlerts.length === 0) return;

      await alertService.markMultipleAsRead(
        unreadAlerts.map(alert => alert.id),
        user.id
      );
      markAllAsRead();
      showSuccess('All alerts marked as read');
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      showError('Failed to mark all alerts as read');
    }
  };

  const getAlertIcon = (alertType, priority) => {
    if (priority === 'high') return <Error color="error" />;
    
    switch (alertType) {
      case 'storm_surge':
      case 'coastal_flooding':
        return <Waves color="primary" />;
      case 'erosion':
        return <Warning color="warning" />;
      case 'pollution':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTimestamp = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, HH:mm');
    } catch {
      return 'Unknown time';
    }
  };

  const AlertItem = ({ alert, index }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <ListItem
        sx={{
          borderRadius: 2,
          mb: 1,
          backgroundColor: alert.status === 'sent' ? 'action.hover' : 'transparent',
          border: alert.status === 'sent' ? '1px solid' : 'none',
          borderColor: alert.status === 'sent' ? 'primary.200' : 'transparent',
          '&:hover': {
            backgroundColor: 'action.selected',
          },
        }}
      >
        <ListItemIcon>
          <Badge
            variant="dot"
            color="error"
            invisible={alert.status === 'read'}
            sx={{
              '& .MuiBadge-badge': {
                top: 8,
                right: 8,
              }
            }}
          >
            {getAlertIcon(alert.alert_type, alert.priority)}
          </Badge>
        </ListItemIcon>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: alert.status === 'sent' ? 600 : 400,
                  fontSize: '0.9rem',
                }}
              >
                {alert.title}
              </Typography>
              <Chip
                label={alert.priority}
                size="small"
                color={getAlertColor(alert.priority)}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.8rem', mb: 0.5 }}
              >
                {alert.message}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ fontSize: 14 }} />
                <Typography variant="caption" color="text.secondary">
                  {getTimestamp(alert.created_at)}
                </Typography>
                {alert.threats?.threat_locations && (
                  <>
                    <LocationOn sx={{ fontSize: 14, ml: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {alert.threats.threat_locations.name}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          }
        />
        
        {alert.status === 'sent' && (
          <IconButton
            size="small"
            onClick={() => handleMarkAsRead(alert.id)}
            sx={{ ml: 1 }}
          >
            <MarkEmailRead fontSize="small" />
          </IconButton>
        )}
      </ListItem>
    </motion.div>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: NOTIFICATION_WIDTH,
          backgroundColor: 'background.default',
        }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="error"
                sx={{ height: 24, fontSize: '0.8rem' }}
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Actions */}
        {unreadCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              startIcon={<ClearAll />}
              onClick={handleMarkAllAsRead}
              variant="outlined"
              fullWidth
            >
              Mark all as read
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : alerts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                All caught up!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No new notifications at the moment.
              </Typography>
            </Box>
          ) : (
            <List sx={{ overflow: 'auto', height: '100%' }}>
              <AnimatePresence>
                {alerts.map((alert, index) => (
                  <AlertItem key={alert.id} alert={alert} index={index} />
                ))}
              </AnimatePresence>
            </List>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
            Real-time notifications are active. You'll be notified of new threats and alerts instantly.
          </Alert>
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;
