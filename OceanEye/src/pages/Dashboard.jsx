import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Alert,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Warning,
  TrendingUp,
  Nature,
  AttachMoney,
  People,
  Speed,
  Refresh,
  Timeline,
  LocationOn,
  WaterDrop,
  Air,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useRealTimeThreats } from '../hooks/useRealTime';
import { dashboardService, threatService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import StatsCard from '../components/StatsCard';
import RecentThreats from '../components/RecentThreats';
import RecentAlerts from '../components/RecentAlerts';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { threats } = useRealTimeThreats();
  const { showError } = useNotification();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [threatStats, setThreatStats] = useState(null);
  const [economicData, setEconomicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [dashboardResponse, threatStatsResponse, economicResponse] = await Promise.all([
        dashboardService.getOverview(user?.role),
        threatService.getStatistics('24h'),
        dashboardService.getEconomicImpact('30d')
      ]);

      setDashboardData(dashboardResponse);
      setThreatStats(threatStatsResponse);
      setEconomicData(economicResponse);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getRoleSpecificGreeting = () => {
    const greetings = {
      'disaster_management': 'Emergency Response Center',
      'environmental_ngo': 'Conservation Dashboard',
      'city_government': 'Municipal Overview',
      'fisherfolk': 'Community Safety Center',
      'civil_defence': 'Civil Defence Command',
    };
    return greetings[user?.role] || 'OceanEye Dashboard';
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  // Mock data for charts
  const threatTimelineData = [
    { time: '00:00', threats: 2 },
    { time: '04:00', threats: 1 },
    { time: '08:00', threats: 4 },
    { time: '12:00', threats: 7 },
    { time: '16:00', threats: 5 },
    { time: '20:00', threats: 3 },
  ];

  const carbonData = [
    { name: 'Mangroves', value: 60, color: theme.palette.success.main },
    { name: 'Seagrass', value: 25, color: theme.palette.info.main },
    { name: 'Salt Marsh', value: 15, color: theme.palette.warning.main },
  ];

  const economicImpactData = [
    { month: 'Jan', prevented: 2.1, potential: 0.8 },
    { month: 'Feb', prevented: 1.8, potential: 1.2 },
    { month: 'Mar', prevented: 2.5, potential: 0.6 },
    { month: 'Apr', prevented: 1.9, potential: 1.0 },
    { month: 'May', prevented: 3.2, potential: 0.4 },
    { month: 'Jun', prevented: 2.8, potential: 0.9 },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {getRoleSpecificGreeting()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.full_name}. Here's what's happening with coastal threats today.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={refreshing ? <LinearProgress /> : <Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Threats"
            value={dashboardData?.overview?.active_threats || 0}
            change="+12%"
            changeType="increase"
            icon={<Warning />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Severity"
            value={dashboardData?.overview?.avg_severity || 0}
            suffix="/10"
            change="-5%"
            changeType="decrease"
            icon={<Speed />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Blue Carbon Protected"
            value={Math.round((dashboardData?.overview?.blue_carbon?.carbon_storage?.total_tons || 0) / 1000)}
            suffix="K tons"
            change="+8%"
            changeType="increase"
            icon={<Nature />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Economic Value"
            value={`$${((dashboardData?.overview?.blue_carbon?.economic_value?.total_usd || 0) / 1000000).toFixed(1)}`}
            suffix="M"
            change="+15%"
            changeType="increase"
            icon={<AttachMoney />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Role-specific Alert */}
      {user?.role === 'disaster_management' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Emergency Alert:</strong> Storm surge warning in effect for Manila Bay area. 
            3 evacuation zones activated. Response teams deployed.
          </Typography>
        </Alert>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Threat Timeline Chart */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Threat Activity (24 Hours)
                  </Typography>
                  <Chip label="Real-time" color="success" size="small" />
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={threatTimelineData}>
                    <defs>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="threats"
                      stroke={theme.palette.primary.main}
                      fillOpacity={1}
                      fill="url(#colorThreats)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Blue Carbon Distribution */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Blue Carbon Habitats
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={carbonData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {carbonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {carbonData.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          mr: 1
                        }}
                      />
                      <Typography variant="body2">
                        {item.name}: {item.value}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Economic Impact Chart */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Economic Impact Prevention (6 Months)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={economicImpactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}M`, '']} />
                    <Bar dataKey="prevented" fill={theme.palette.success.main} name="Damage Prevented" />
                    <Bar dataKey="potential" fill={theme.palette.error.main} name="Potential Loss" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Threats */}
        <Grid item xs={12} lg={4}>
          <RecentThreats threats={threats.slice(0, 5)} />
        </Grid>

        {/* Environmental Conditions */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Current Environmental Conditions
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <WaterDrop sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        2.8m
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tide Height
                      </Typography>
                      <Chip label="High Tide" color="warning" size="small" sx={{ mt: 1 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Air sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        25 km/h
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wind Speed
                      </Typography>
                      <Chip label="Moderate" color="info" size="small" sx={{ mt: 1 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        28°C
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sea Temperature
                      </Typography>
                      <Chip label="Normal" color="success" size="small" sx={{ mt: 1 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        1012 hPa
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pressure
                      </Typography>
                      <Chip label="Stable" color="success" size="small" sx={{ mt: 1 }} />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
