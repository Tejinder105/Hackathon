import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  NotificationsActive,
  CheckCircle,
  Info,
  Warning,
  Error,
  ChevronRight,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const RecentAlerts = ({ alerts = [] }) => {
  const navigate = useNavigate();

  const getAlertIcon = (status) => {
    const icons = {
      active: <NotificationsActive />,
      resolved: <CheckCircle />,
      pending: <Info />,
    };
    return icons[status] || <Info />;
  };

  const getAlertColor = (priority) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success',
    };
    return colors[priority] || 'info';
  };

  const getSeverityIcon = (priority) => {
    const icons = {
      critical: <Error />,
      high: <Warning />,
      medium: <Info />,
      low: <CheckCircle />,
    };
    return icons[priority] || <Info />;
  };

  const getTimeAgo = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return 'Unknown';
    }
  };

  const formatAlertType = (type) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'System Alert';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Alerts
          </Typography>
          <Button
            size="small"
            endIcon={<ChevronRight />}
            onClick={() => navigate('/alerts')}
          >
            View All
          </Button>
        </Box>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'success.50',
                color: 'success.main',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircle sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              No Active Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All systems are running normally. Monitoring continues 24/7.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem
                    sx={{
                      px: 0,
                      py: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => navigate(`/alerts/${alert.id}`)}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: `${getAlertColor(alert.priority)}.50`,
                          color: `${getAlertColor(alert.priority)}.main`,
                        }}
                      >
                        {getSeverityIcon(alert.priority)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatAlertType(alert.alert_type)}
                          </Typography>
                          <Chip
                            label={alert.priority?.toUpperCase() || 'UNKNOWN'}
                            size="small"
                            color={getAlertColor(alert.priority)}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          {alert.status === 'active' && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'error.main',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%': { opacity: 1 },
                                  '50%': { opacity: 0.5 },
                                  '100%': { opacity: 1 },
                                },
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 0.5,
                            }}
                          >
                            {alert.message || 'No description available'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getTimeAgo(alert.created_at)} • Status: {alert.status || 'unknown'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < alerts.length - 1 && <Divider sx={{ my: 1 }} />}
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAlerts;
