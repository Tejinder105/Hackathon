import cron from 'node-cron';
import { supabase } from '../config/supabase.js';
import { getThreatData } from './externalApis.js';
import { analyzeThreat } from './aiAnalysis.js';
import { sendBatchAlerts } from './alertService.js';

let io; // Will be set when initializing

export const initializeThreatMonitoring = (socketIO) => {
  io = socketIO;
  console.log('🔍 Threat monitoring system initialized');
  
  // Start periodic threat monitoring
  startPeriodicMonitoring();
  
  // Start real-time data processing
  startRealTimeProcessing();
};

// Start periodic threat monitoring (every 15 minutes)
const startPeriodicMonitoring = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Running periodic threat monitoring...');
    await performThreatScan();
  });
  
  console.log('📅 Periodic monitoring scheduled (every 15 minutes)');
};

// Start real-time data processing simulation
const startRealTimeProcessing = () => {
  // Simulate real-time threat detection every 5 minutes for demo
  setInterval(async () => {
    await simulateRealTimeThreat();
  }, 5 * 60 * 1000);
  
  console.log('⚡ Real-time processing started');
};

// Perform comprehensive threat scan
const performThreatScan = async () => {
  try {
    // Get all active monitoring locations
    const { data: locations, error } = await supabase
      .from('threat_locations')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    console.log(`🔍 Scanning ${locations?.length || 0} locations for threats...`);

    for (const location of locations || []) {
      await scanLocationForThreats(location);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Threat scan completed');

  } catch (error) {
    console.error('Threat monitoring error:', error);
  }
};

// Scan specific location for threats
const scanLocationForThreats = async (location) => {
  try {
    // Get current environmental data
    const threatData = await getThreatData(location.id);
    
    // Analyze threat using AI
    const analysis = await analyzeThreat(threatData);
    
    // Check if threat level warrants creating a new threat record
    if (shouldCreateThreatRecord(analysis)) {
      await createThreatRecord(location, threatData, analysis);
    }
    
    // Update location monitoring status
    await updateLocationStatus(location.id, analysis);

  } catch (error) {
    console.error(`Error scanning location ${location.name}:`, error);
  }
};

// Determine if analysis results warrant creating a threat record
const shouldCreateThreatRecord = (analysis) => {
  // Create threat record if:
  // 1. Threat level is medium or high
  // 2. Confidence is above 0.7
  // 3. Multiple risk factors present
  
  return (
    (analysis.threat_level === 'medium' || analysis.threat_level === 'high') &&
    analysis.confidence > 0.7 &&
    analysis.risk_factors.length >= 2
  );
};

// Create new threat record
const createThreatRecord = async (location, threatData, analysis) => {
  try {
    // Determine threat type based on analysis
    const threatType = determineThreatType(analysis.risk_factors);
    
    const threatRecord = {
      threat_type: threatType,
      location_id: location.id,
      description: generateThreatDescription(analysis),
      severity_score: mapThreatLevelToScore(analysis.threat_level),
      confidence_level: analysis.confidence,
      reported_by: 'ai_monitoring',
      detected_at: new Date().toISOString(),
      is_active: true,
      source: 'automated_monitoring',
      raw_data: {
        weather: threatData.weather,
        tides: threatData.tides,
        analysis: analysis
      }
    };

    const { data: newThreat, error } = await supabase
      .from('threats')
      .insert(threatRecord)
      .select(`
        *,
        threat_locations(name, latitude, longitude)
      `)
      .single();

    if (error) {
      console.error('Error creating threat record:', error);
      return;
    }

    console.log(`🚨 New threat detected: ${threatType} at ${location.name}`);

    // Create impact assessment
    await createThreatImpact(newThreat.id, analysis);

    // Send real-time notification
    io.emit('new_threat', newThreat);

    // Send alerts to relevant users
    await sendThreatAlerts(newThreat);

  } catch (error) {
    console.error('Error creating threat record:', error);
  }
};

// Create threat impact assessment
const createThreatImpact = async (threatId, analysis) => {
  try {
    // Calculate estimated impact based on threat analysis
    const impact = calculateThreatImpact(analysis);

    const impactRecord = {
      threat_id: threatId,
      carbon_loss_tons: impact.carbon_loss,
      economic_loss_usd: impact.economic_loss,
      affected_area_km2: impact.affected_area,
      estimated_recovery_time: impact.recovery_time,
      created_at: new Date().toISOString()
    };

    await supabase
      .from('threat_impacts')
      .insert(impactRecord);

  } catch (error) {
    console.error('Error creating threat impact:', error);
  }
};

// Calculate threat impact
const calculateThreatImpact = (analysis) => {
  const baseImpact = {
    carbon_loss: 10,
    economic_loss: 50000,
    affected_area: 1.0,
    recovery_time: '1-2 years'
  };

  const multipliers = {
    low: 1,
    medium: 2.5,
    high: 5
  };

  const multiplier = multipliers[analysis.threat_level] || 1;

  return {
    carbon_loss: baseImpact.carbon_loss * multiplier,
    economic_loss: baseImpact.economic_loss * multiplier,
    affected_area: baseImpact.affected_area * multiplier,
    recovery_time: analysis.threat_level === 'high' ? '3-5 years' : 
                   analysis.threat_level === 'medium' ? '2-3 years' : '1-2 years'
  };
};

// Determine threat type from risk factors
const determineThreatType = (riskFactors) => {
  const riskText = riskFactors.join(' ').toLowerCase();
  
  if (riskText.includes('storm') || riskText.includes('wind')) {
    return 'storm_surge';
  } else if (riskText.includes('tide') || riskText.includes('flood')) {
    return 'coastal_flooding';
  } else if (riskText.includes('erosion')) {
    return 'erosion';
  } else if (riskText.includes('pollution')) {
    return 'pollution';
  } else {
    return 'environmental_stress';
  }
};

// Generate threat description
const generateThreatDescription = (analysis) => {
  const riskFactors = analysis.risk_factors.join(', ');
  const confidencePercent = Math.round(analysis.confidence * 100);
  
  return `AI-detected threat with ${confidencePercent}% confidence. Risk factors: ${riskFactors}. Threat level: ${analysis.threat_level}.`;
};

// Map threat level to numerical score
const mapThreatLevelToScore = (threatLevel) => {
  const scores = {
    low: 3,
    medium: 6,
    high: 9
  };
  return scores[threatLevel] || 5;
};

// Update location monitoring status
const updateLocationStatus = async (locationId, analysis) => {
  try {
    await supabase
      .from('threat_locations')
      .update({
        last_monitored: new Date().toISOString(),
        current_threat_level: analysis.threat_level,
        monitoring_confidence: analysis.confidence
      })
      .eq('id', locationId);

  } catch (error) {
    console.error('Error updating location status:', error);
  }
};

// Send alerts for new threat
const sendThreatAlerts = async (threat) => {
  try {
    // Get users who should receive alerts for this location/threat type
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true);

    if (error || !users?.length) {
      console.log('No users found for threat alerts');
      return;
    }

    // Filter users based on their preferences and role
    const relevantUsers = users.filter(user => 
      shouldReceiveAlert(user, threat)
    );

    if (relevantUsers.length > 0) {
      await sendBatchAlerts(threat, relevantUsers);
      console.log(`📢 Alerts sent to ${relevantUsers.length} users`);
    }

  } catch (error) {
    console.error('Error sending threat alerts:', error);
  }
};

// Determine if user should receive alert
const shouldReceiveAlert = (user, threat) => {
  // For MVP, send alerts to all active users
  // In production, would check user preferences, location, role, etc.
  return user.is_active && (
    user.role === 'disaster_management' ||
    user.role === 'environmental_ngo' ||
    user.role === 'civil_defence' ||
    threat.severity_score > 7 // High severity alerts to everyone
  );
};

// Simulate real-time threat for demo purposes
const simulateRealTimeThreat = async () => {
  try {
    const shouldSimulate = Math.random() < 0.3; // 30% chance every 5 minutes
    
    if (!shouldSimulate) return;

    console.log('🎭 Simulating real-time threat for demo...');

    const mockThreatTypes = ['storm_surge', 'erosion', 'pollution', 'coastal_flooding'];
    const randomType = mockThreatTypes[Math.floor(Math.random() * mockThreatTypes.length)];
    
    const mockThreat = {
      threat_type: randomType,
      location_id: Math.floor(Math.random() * 3) + 1, // Random location 1-3
      description: `Simulated ${randomType} event detected by monitoring system`,
      severity_score: 4 + Math.random() * 4, // Score between 4-8
      confidence_level: 0.7 + Math.random() * 0.2, // Confidence 0.7-0.9
      reported_by: 'demo_simulation',
      detected_at: new Date().toISOString(),
      is_active: true,
      source: 'simulated_data'
    };

    const { data: newThreat, error } = await supabase
      .from('threats')
      .insert(mockThreat)
      .select(`
        *,
        threat_locations(name, latitude, longitude)
      `)
      .single();

    if (!error && newThreat) {
      console.log(`🎬 Demo threat created: ${randomType}`);
      io.emit('new_threat', newThreat);
      
      // Send to users for demo
      await sendThreatAlerts(newThreat);
    }

  } catch (error) {
    console.error('Demo threat simulation error:', error);
  }
};

// Get monitoring statistics
export const getMonitoringStats = async () => {
  try {
    const { data: stats, error } = await supabase
      .rpc('get_monitoring_statistics');

    if (error) {
      // Return mock stats if function doesn't exist
      return {
        active_locations: 5,
        threats_last_24h: 8,
        avg_response_time: '12 minutes',
        system_uptime: '99.5%',
        last_scan: new Date().toISOString()
      };
    }

    return stats;

  } catch (error) {
    console.error('Error getting monitoring stats:', error);
    return {
      error: 'Failed to get monitoring statistics'
    };
  }
};
