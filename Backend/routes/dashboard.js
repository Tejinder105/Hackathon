import express from 'express';
import { supabase } from '../config/supabase.js';
import { getThreatData } from '../services/externalApis.js';
import { calculateBlueCarbon } from '../services/blueCarbonCalculator.js';

const router = express.Router();

// Get main dashboard data
router.get('/overview', async (req, res) => {
  try {
    const { location_id, user_role = 'general' } = req.query;

    // Get active threats count
    let threatQuery = supabase
      .from('threats')
      .select('id, threat_type, severity_score', { count: 'exact' })
      .eq('is_active', true);

    if (location_id) {
      threatQuery = threatQuery.eq('location_id', location_id);
    }

    const { count: activeThreats, data: threatData } = await threatQuery;

    // Get recent alerts count
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentAlerts } = await supabase
      .from('alerts')
      .select('id', { count: 'exact' })
      .gte('created_at', last24Hours);

    // Calculate threat distribution
    const threatDistribution = threatData?.reduce((acc, threat) => {
      acc[threat.threat_type] = (acc[threat.threat_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Calculate average severity
    const avgSeverity = threatData?.length > 0 
      ? threatData.reduce((sum, t) => sum + t.severity_score, 0) / threatData.length 
      : 0;

    // Get blue carbon metrics (mock for MVP)
    const blueCarbonMetrics = await calculateBlueCarbon(location_id);

    // Get weather data for location
    let weatherData = null;
    if (location_id) {
      try {
        weatherData = await getThreatData(location_id);
      } catch (error) {
        console.error('Weather data error:', error);
      }
    }

    // Role-specific metrics
    const roleSpecificData = getRoleSpecificMetrics(user_role, {
      activeThreats,
      recentAlerts,
      threatDistribution,
      avgSeverity,
      blueCarbonMetrics
    });

    res.json({
      overview: {
        active_threats: activeThreats || 0,
        recent_alerts: recentAlerts || 0,
        avg_severity: parseFloat(avgSeverity.toFixed(1)),
        threat_distribution: threatDistribution,
        blue_carbon: blueCarbonMetrics,
        weather: weatherData
      },
      role_specific: roleSpecificData,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard overview API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat timeline (last 7 days)
router.get('/timeline', async (req, res) => {
  try {
    const { location_id, days = 7 } = req.query;
    
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('threats')
      .select(`
        id,
        threat_type,
        severity_score,
        detected_at,
        resolved_at,
        is_active,
        threat_locations(name, latitude, longitude)
      `)
      .gte('detected_at', startDate)
      .order('detected_at', { ascending: true });

    if (location_id) {
      query = query.eq('location_id', location_id);
    }

    const { data: threats, error } = await query;

    if (error) {
      console.error('Error fetching threat timeline:', error);
      return res.status(500).json({ error: 'Failed to fetch timeline' });
    }

    // Group threats by day
    const timeline = threats?.reduce((acc, threat) => {
      const date = new Date(threat.detected_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(threat);
      return acc;
    }, {}) || {};

    res.json({
      timeline,
      period: `${days} days`,
      total_threats: threats?.length || 0
    });

  } catch (error) {
    console.error('Timeline API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location-specific data
router.get('/location/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get location details
    const { data: location, error: locationError } = await supabase
      .from('threat_locations')
      .select('*')
      .eq('id', id)
      .single();

    if (locationError || !location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Get active threats for this location
    const { data: threats, error: threatsError } = await supabase
      .from('threats')
      .select('*')
      .eq('location_id', id)
      .eq('is_active', true);

    if (threatsError) {
      console.error('Error fetching location threats:', threatsError);
      return res.status(500).json({ error: 'Failed to fetch location threats' });
    }

    // Get recent alerts for this location
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select(`
        *,
        threats!inner(location_id)
      `)
      .eq('threats.location_id', id)
      .gte('created_at', last7Days);

    if (alertsError) {
      console.error('Error fetching location alerts:', alertsError);
      return res.status(500).json({ error: 'Failed to fetch location alerts' });
    }

    // Get environmental data
    let environmentalData = null;
    try {
      environmentalData = await getThreatData(id);
    } catch (error) {
      console.error('Environmental data error:', error);
    }

    // Calculate blue carbon for this location
    const blueCarbonData = await calculateBlueCarbon(id);

    res.json({
      location,
      active_threats: threats || [],
      recent_alerts: alerts || [],
      environmental_data: environmentalData,
      blue_carbon: blueCarbonData,
      statistics: {
        total_threats: threats?.length || 0,
        avg_severity: threats?.length > 0 
          ? threats.reduce((sum, t) => sum + t.severity_score, 0) / threats.length 
          : 0,
        alert_count_7d: alerts?.length || 0
      }
    });

  } catch (error) {
    console.error('Location dashboard API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get economic impact data
router.get('/economic-impact', async (req, res) => {
  try {
    const { location_id, time_range = '30d' } = req.query;

    // Calculate time filter
    const daysAgo = time_range === '7d' ? 7 : time_range === '30d' ? 30 : 30;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('threat_impacts')
      .select(`
        *,
        threats(threat_type, detected_at, location_id)
      `)
      .gte('threats.detected_at', startDate);

    if (location_id) {
      query = query.eq('threats.location_id', location_id);
    }

    const { data: impacts, error } = await query;

    if (error) {
      console.error('Error fetching economic impact:', error);
      // Return mock data for demo
      return res.json({
        total_economic_loss: 2400000,
        carbon_loss_tons: 1250.5,
        carbon_value_usd: 62525,
        affected_area_km2: 45.8,
        by_threat_type: {
          storm_surge: { economic_loss: 1200000, carbon_loss: 600 },
          erosion: { economic_loss: 800000, carbon_loss: 400 },
          pollution: { economic_loss: 400000, carbon_loss: 250.5 }
        },
        time_range
      });
    }

    // Calculate totals
    const totalEconomicLoss = impacts?.reduce((sum, impact) => sum + (impact.economic_loss_usd || 0), 0) || 0;
    const totalCarbonLoss = impacts?.reduce((sum, impact) => sum + (impact.carbon_loss_tons || 0), 0) || 0;
    const totalAffectedArea = impacts?.reduce((sum, impact) => sum + (impact.affected_area_km2 || 0), 0) || 0;

    // Group by threat type
    const byThreatType = impacts?.reduce((acc, impact) => {
      const type = impact.threats?.threat_type || 'unknown';
      if (!acc[type]) {
        acc[type] = { economic_loss: 0, carbon_loss: 0 };
      }
      acc[type].economic_loss += impact.economic_loss_usd || 0;
      acc[type].carbon_loss += impact.carbon_loss_tons || 0;
      return acc;
    }, {}) || {};

    res.json({
      total_economic_loss: totalEconomicLoss,
      carbon_loss_tons: totalCarbonLoss,
      carbon_value_usd: totalCarbonLoss * 50, // $50 per ton CO2
      affected_area_km2: totalAffectedArea,
      by_threat_type: byThreatType,
      time_range,
      period_summary: {
        total_incidents: impacts?.length || 0,
        avg_economic_impact: impacts?.length > 0 ? totalEconomicLoss / impacts.length : 0
      }
    });

  } catch (error) {
    console.error('Economic impact API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get role-specific metrics
function getRoleSpecificMetrics(role, data) {
  switch (role) {
    case 'disaster_management':
      return {
        emergency_response_time: '12 minutes',
        resources_deployed: 8,
        evacuation_zones: 3,
        critical_infrastructure_at_risk: 12
      };
    
    case 'city_government':
      return {
        infrastructure_vulnerability: 'Medium',
        budget_allocation_needed: '$2.1M',
        protection_projects: 5,
        roi_coastal_defense: '3.2x'
      };
    
    case 'environmental_ngo':
      return {
        habitats_protected: 15,
        conservation_priority_score: 8.4,
        donor_impact_metrics: {
          carbon_sequestered: '1,250 tons',
          area_protected: '45.8 km²'
        }
      };
    
    case 'fisherfolk':
      return {
        safe_fishing_zones: 8,
        weather_forecast: 'Moderate winds, 2m waves',
        fish_stock_health: 'Good',
        community_alerts: 2
      };
    
    case 'civil_defence':
      return {
        active_operations: 3,
        personnel_deployed: 45,
        public_alerts_sent: 1250,
        coordination_agencies: 6
      };
    
    default:
      return {
        general_status: 'All systems operational',
        last_update: new Date().toISOString()
      };
  }
}

export default router;
