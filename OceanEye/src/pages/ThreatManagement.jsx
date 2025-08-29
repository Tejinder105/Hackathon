import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fab,
  Tooltip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  Add,
  FilterList,
  Search,
  Warning,
  CheckCircle,
  Schedule,
  Map,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { threatService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const ThreatManagement = () => {
  const { showNotification } = useNotification();
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const response = await threatService.getThreats();
      setThreats(response.data || []);
    } catch (error) {
      showNotification('Failed to fetch threats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewThreat = (threat) => {
    setSelectedThreat(threat);
    setViewDialogOpen(true);
  };

  const handleDeleteThreat = async () => {
    try {
      await threatService.deleteThreat(selectedThreat.id);
      setThreats(threats.filter(t => t.id !== selectedThreat.id));
      setDeleteDialogOpen(false);
      setSelectedThreat(null);
      showNotification('Threat deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete threat', 'error');
    }
  };

  const getThreatStatusColor = (status) => {
    const colors = {
      active: 'error',
      monitoring: 'warning',
      resolved: 'success',
    };
    return colors[status] || 'default';
  };

  const getSeverityColor = (score) => {
    if (score >= 7) return 'error';
    if (score >= 4) return 'warning';
    return 'info';
  };

  const getSeverityLabel = (score) => {
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  const formatThreatType = (type) => {
    return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.threat_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.threat_locations?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || threat.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || 
                           (filterSeverity === 'high' && threat.severity_score >= 7) ||
                           (filterSeverity === 'medium' && threat.severity_score >= 4 && threat.severity_score < 7) ||
                           (filterSeverity === 'low' && threat.severity_score < 4);
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getThreatIcon = (type) => {
    const icons = {
      storm_surge: '🌊',
      coastal_flooding: '💧',
      erosion: '⛰️',
      pollution: '☠️',
      environmental_stress: '🌡️',
    };
    return icons[type] || '⚠️';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Threat Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage coastal threats detected by AI systems
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="monitoring">Monitoring</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Severity"
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                >
                  <MenuItem value="all">All Severity</MenuItem>
                  <MenuItem value="high">High (7-10)</MenuItem>
                  <MenuItem value="medium">Medium (4-6)</MenuItem>
                  <MenuItem value="low">Low (1-3)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterSeverity('all');
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Threats Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <LinearProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Threat</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Detected</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AnimatePresence>
                      {filteredThreats.map((threat, index) => (
                        <motion.tr
                          key={threat.id}
                          component={TableRow}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          hover
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 40, height: 40, fontSize: '1.2rem' }}>
                                {getThreatIcon(threat.threat_type)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatThreatType(threat.threat_type)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {threat.id.slice(0, 8)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Map sx={{ fontSize: 16, color: 'action.active' }} />
                              <Typography variant="body2">
                                {threat.threat_locations?.name || 'Unknown'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${getSeverityLabel(threat.severity_score)} (${threat.severity_score}/10)`}
                              color={getSeverityColor(threat.severity_score)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={threat.status?.toUpperCase() || 'UNKNOWN'}
                              color={getThreatStatusColor(threat.status)}
                              size="small"
                              icon={
                                threat.status === 'active' ? <Warning /> :
                                threat.status === 'resolved' ? <CheckCircle /> :
                                <Schedule />
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(threat.detected_at), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(threat.detected_at), 'HH:mm')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewThreat(threat)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedThreat(threat);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!loading && filteredThreats.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'grey.100',
                    color: 'grey.400',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Warning sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  No Threats Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || filterStatus !== 'all' || filterSeverity !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No threats have been detected yet. Systems are monitoring continuously.'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Threat Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedThreat && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ fontSize: '1.5rem' }}>
                  {getThreatIcon(selectedThreat.threat_type)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {formatThreatType(selectedThreat.threat_type)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Threat ID: {selectedThreat.id}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedThreat.threat_locations?.name || 'Unknown location'}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Severity Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h4" color={getSeverityColor(selectedThreat.severity_score) + '.main'}>
                      {selectedThreat.severity_score}
                    </Typography>
                    <Typography variant="body2">/10</Typography>
                    <Chip
                      label={getSeverityLabel(selectedThreat.severity_score)}
                      color={getSeverityColor(selectedThreat.severity_score)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={selectedThreat.status?.toUpperCase() || 'UNKNOWN'}
                    color={getThreatStatusColor(selectedThreat.status)}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detection Time
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {format(new Date(selectedThreat.detected_at), 'PPpp')}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    AI Analysis
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedThreat.ai_analysis || 'No detailed analysis available.'}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Impact Assessment
                  </Typography>
                  <Typography variant="body2">
                    {selectedThreat.impact_assessment || 'Impact assessment pending.'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this threat record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteThreat} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ThreatManagement;
