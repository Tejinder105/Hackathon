import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Warning,
  Waves,
  LocationOn,
  Schedule,
  ChevronRight,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const RecentThreats = ({ threats = [] }) => {
  const navigate = useNavigate();

  const getThreatIcon = (threatType) => {
    const icons = {
      storm_surge: <Waves />,
      coastal_flooding: <Waves />,
      erosion: <Warning />,
      pollution: <Warning />,
      environmental_stress: <Warning />,
    };
    return icons[threatType] || <Warning />;
  };

  const getThreatColor = (severityScore) => {
    if (severityScore >= 7) return 'error';
    if (severityScore >= 4) return 'warning';
    return 'info';
  };

  const getSeverityLabel = (severityScore) => {
    if (severityScore >= 7) return 'High';
    if (severityScore >= 4) return 'Medium';
    return 'Low';
  };

  const formatThreatType = (type) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const getTimeAgo = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Threats
          </Typography>
          <Button
            size="small"
            endIcon={<ChevronRight />}
            onClick={() => navigate('/threats')}
          >
            View All
          </Button>
        </Box>

        {threats.length === 0 ? (
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
              <Waves sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              All Clear
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent threats detected. Systems are monitoring continuously.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            <AnimatePresence>
              {threats.map((threat, index) => (
                <motion.div
                  key={threat.id}
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
                    onClick={() => navigate(`/threats/${threat.id}`)}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: `${getThreatColor(threat.severity_score)}.50`,
                          color: `${getThreatColor(threat.severity_score)}.main`,
                        }}
                      >
                        {getThreatIcon(threat.threat_type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatThreatType(threat.threat_type)}
                          </Typography>
                          <Chip
                            label={getSeverityLabel(threat.severity_score)}
                            size="small"
                            color={getThreatColor(threat.severity_score)}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <LocationOn sx={{ fontSize: 14 }} />
                            <Typography variant="caption" color="text.secondary">
                              {threat.threat_locations?.name || 'Unknown location'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Schedule sx={{ fontSize: 14 }} />
                            <Typography variant="caption" color="text.secondary">
                              {getTimeAgo(threat.detected_at)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < threats.length - 1 && <Divider sx={{ my: 1 }} />}
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentThreats;
