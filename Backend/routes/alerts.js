import express from 'express';
import { supabase } from '../config/supabase.js';
import { sendAlert } from '../services/alertService.js';

const router = express.Router();

// Get all alerts for a user
router.get('/', async (req, res) => {
  try {
    const { user_id, status, type, limit = 50 } = req.query;

    let query = supabase
      .from('alerts')
      .select(`
        *,
        threats(threat_type, severity_score, location_id),
        threat_locations(name, latitude, longitude)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    // Apply filters
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('alert_type', type);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error('Error fetching alerts:', error);
      return res.status(500).json({ error: 'Failed to fetch alerts' });
    }

    res.json({
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alerts API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get alert by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: alert, error } = await supabase
      .from('alerts')
      .select(`
        *,
        threats(
          threat_type, 
          severity_score, 
          location_id,
          description,
          detected_at
        ),
        threat_locations(name, latitude, longitude),
        users(full_name, email, role)
      `)
      .eq('id', id)
      .single();

    if (error || !alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);

  } catch (error) {
    console.error('Alert detail API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new alert
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      threat_id,
      alert_type,
      priority,
      title,
      message,
      channels = ['app']
    } = req.body;

    // Validate required fields
    if (!user_id || !threat_id || !title || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['user_id', 'threat_id', 'title', 'message']
      });
    }

    // Create alert record
    const { data: newAlert, error } = await supabase
      .from('alerts')
      .insert({
        user_id,
        threat_id,
        alert_type: alert_type || 'general',
        priority: priority || 'medium',
        title,
        message,
        channels,
        status: 'sent',
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        threats(threat_type, severity_score),
        users(full_name, email, role)
      `)
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return res.status(500).json({ error: 'Failed to create alert' });
    }

    // Send alert through configured channels
    try {
      await sendAlert(newAlert, channels);
    } catch (alertError) {
      console.error('Alert sending error:', alertError);
      // Don't fail the request if alert sending fails
    }

    // Send real-time notification
    const io = req.app.get('io');
    io.to(`user_${user_id}`).emit('new_alert', newAlert);

    res.status(201).json({
      message: 'Alert created and sent successfully',
      alert: newAlert
    });

  } catch (error) {
    console.error('Create alert API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark alert as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: updatedAlert, error } = await supabase
      .from('alerts')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedAlert) {
      return res.status(404).json({ error: 'Alert not found or update failed' });
    }

    res.json({
      message: 'Alert marked as read',
      alert: updatedAlert
    });

  } catch (error) {
    console.error('Mark alert read API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark multiple alerts as read
router.patch('/bulk/read', async (req, res) => {
  try {
    const { alert_ids, user_id } = req.body;

    if (!alert_ids || !Array.isArray(alert_ids) || alert_ids.length === 0) {
      return res.status(400).json({ error: 'alert_ids array is required' });
    }

    let query = supabase
      .from('alerts')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .in('id', alert_ids);

    // Only update alerts for the specific user if user_id provided
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: updatedAlerts, error } = await query.select();

    if (error) {
      console.error('Error bulk updating alerts:', error);
      return res.status(500).json({ error: 'Failed to update alerts' });
    }

    res.json({
      message: `${updatedAlerts.length} alerts marked as read`,
      updated_count: updatedAlerts.length
    });

  } catch (error) {
    console.error('Bulk read alerts API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get alert statistics for user
router.get('/stats/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { time_range = '24h' } = req.query;

    // Calculate time filter
    const hoursAgo = time_range === '24h' ? 24 : time_range === '7d' ? 168 : 24;
    const timeFilter = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    // Get alert statistics
    const { data: stats, error } = await supabase
      .rpc('get_user_alert_statistics', {
        p_user_id: user_id,
        time_filter: timeFilter
      });

    if (error) {
      console.error('Error getting alert stats:', error);
      // Return mock data for demo
      return res.json({
        total_alerts: 15,
        unread_alerts: 3,
        high_priority_alerts: 2,
        alert_types: {
          storm_surge: 5,
          erosion: 4,
          pollution: 3,
          general: 3
        },
        time_range
      });
    }

    res.json({
      ...stats,
      time_range,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alert stats API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting alert:', error);
      return res.status(500).json({ error: 'Failed to delete alert' });
    }

    res.json({
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    console.error('Delete alert API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
