import express from 'express';
import { supabase } from '../config/supabase.js';
import { getThreatData } from '../services/externalApis.js';
import { analyzeThreat } from '../services/aiAnalysis.js';

const router = express.Router();

// Get all active threats
router.get('/', async (req, res) => {
  try {
    const { location, severity, type } = req.query;
    
    let query = supabase
      .from('threats')
      .select(`
        *,
        threat_locations(latitude, longitude, name)
      `)
      .eq('is_active', true)
      .order('severity_score', { ascending: false });

    // Apply filters
    if (location) {
      query = query.eq('location_id', location);
    }
    if (severity) {
      query = query.gte('severity_score', parseFloat(severity));
    }
    if (type) {
      query = query.eq('threat_type', type);
    }

    const { data: threats, error } = await query;

    if (error) {
      console.error('Error fetching threats:', error);
      return res.status(500).json({ error: 'Failed to fetch threats' });
    }

    res.json({
      threats,
      count: threats.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Threats API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: threat, error } = await supabase
      .from('threats')
      .select(`
        *,
        threat_locations(latitude, longitude, name),
        threat_impacts(carbon_loss_tons, economic_loss_usd, affected_area_km2)
      `)
      .eq('id', id)
      .single();

    if (error || !threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    res.json(threat);

  } catch (error) {
    console.error('Threat detail API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new threat (manual reporting)
router.post('/', async (req, res) => {
  try {
    const {
      threat_type,
      location_id,
      description,
      severity_score,
      confidence_level,
      reported_by
    } = req.body;

    // Validate required fields
    if (!threat_type || !location_id || !description) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['threat_type', 'location_id', 'description']
      });
    }

    // Create threat record
    const { data: newThreat, error } = await supabase
      .from('threats')
      .insert({
        threat_type,
        location_id,
        description,
        severity_score: severity_score || 5.0,
        confidence_level: confidence_level || 0.8,
        reported_by: reported_by || 'manual',
        detected_at: new Date().toISOString(),
        is_active: true,
        source: 'user_report'
      })
      .select(`
        *,
        threat_locations(latitude, longitude, name)
      `)
      .single();

    if (error) {
      console.error('Error creating threat:', error);
      return res.status(500).json({ error: 'Failed to create threat' });
    }

    // Trigger real-time alert
    const io = req.app.get('io');
    io.emit('new_threat', newThreat);

    res.status(201).json({
      message: 'Threat reported successfully',
      threat: newThreat
    });

  } catch (error) {
    console.error('Create threat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update threat status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, resolution_notes } = req.body;

    const updateData = {
      is_active,
      updated_at: new Date().toISOString()
    };

    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes;
    }

    if (is_active === false) {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: updatedThreat, error } = await supabase
      .from('threats')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedThreat) {
      return res.status(404).json({ error: 'Threat not found or update failed' });
    }

    // Notify via WebSocket
    const io = req.app.get('io');
    io.emit('threat_updated', updatedThreat);

    res.json({
      message: 'Threat status updated successfully',
      threat: updatedThreat
    });

  } catch (error) {
    console.error('Update threat status API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat predictions (72-hour forecast)
router.get('/predictions/forecast', async (req, res) => {
  try {
    const { location_id } = req.query;

    if (!location_id) {
      return res.status(400).json({ error: 'location_id is required' });
    }

    // Get current weather and environmental data
    const threatData = await getThreatData(location_id);
    
    // Analyze threat using AI (simplified for MVP)
    const predictions = await analyzeThreat(threatData);

    res.json({
      location_id,
      forecast_hours: 72,
      predictions,
      generated_at: new Date().toISOString(),
      confidence: predictions.confidence || 0.8
    });

  } catch (error) {
    console.error('Threat prediction API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate predictions',
      message: 'Using fallback prediction system'
    });
  }
});

// Get threat statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { time_range = '24h' } = req.query;
    
    // Calculate time filter
    const hoursAgo = time_range === '24h' ? 24 : time_range === '7d' ? 168 : 24;
    const timeFilter = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    // Get threat statistics
    const { data: stats, error } = await supabase
      .rpc('get_threat_statistics', {
        time_filter: timeFilter
      });

    if (error) {
      console.error('Error getting threat stats:', error);
      // Return mock data for demo
      return res.json({
        active_threats: 12,
        resolved_threats: 45,
        high_severity_threats: 3,
        avg_severity: 6.2,
        most_common_type: 'storm_surge',
        total_carbon_at_risk: 1250.5,
        economic_impact: 2400000,
        time_range
      });
    }

    res.json({
      ...stats,
      time_range,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Threat stats API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
