import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, organization, location, created_at, last_login')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user,
      message: 'Profile retrieved successfully'
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.patch('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, organization, location } = req.body;

    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (organization) updateData.organization = organization;
    if (location) updateData.location = location;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, full_name, role, organization, location, updated_at')
      .single();

    if (error || !updatedUser) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user preferences
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Get preferences error:', error);
      return res.status(500).json({ error: 'Failed to get preferences' });
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      alert_channels: ['app'],
      threat_types: ['storm_surge', 'erosion', 'pollution'],
      notification_frequency: 'immediate',
      language: 'en',
      timezone: 'UTC'
    };

    res.json({
      preferences: preferences || defaultPreferences
    });

  } catch (error) {
    console.error('Get preferences API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user preferences
router.put('/preferences', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      alert_channels,
      threat_types,
      notification_frequency,
      language,
      timezone
    } = req.body;

    const preferencesData = {
      user_id: userId,
      alert_channels: alert_channels || ['app'],
      threat_types: threat_types || ['storm_surge', 'erosion', 'pollution'],
      notification_frequency: notification_frequency || 'immediate',
      language: language || 'en',
      timezone: timezone || 'UTC',
      updated_at: new Date().toISOString()
    };

    // Upsert preferences
    const { data: updatedPreferences, error } = await supabase
      .from('user_preferences')
      .upsert(preferencesData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Update preferences error:', error);
      return res.status(500).json({ error: 'Failed to update preferences' });
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });

  } catch (error) {
    console.error('Update preferences API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user activity log
router.get('/activity', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Get user's alerts and interactions
    const { data: activities, error } = await supabase
      .from('alerts')
      .select(`
        id,
        title,
        status,
        created_at,
        read_at,
        threats(threat_type, severity_score)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Get activity error:', error);
      return res.status(500).json({ error: 'Failed to get activity' });
    }

    res.json({
      activities: activities || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: activities?.length || 0
      }
    });

  } catch (error) {
    console.error('Activity API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/statistics', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get alert statistics
    const { data: alertStats, error: alertError } = await supabase
      .from('alerts')
      .select('status, priority, created_at')
      .eq('user_id', userId);

    if (alertError) {
      console.error('Get alert stats error:', alertError);
      return res.status(500).json({ error: 'Failed to get statistics' });
    }

    // Calculate statistics
    const totalAlerts = alertStats?.length || 0;
    const unreadAlerts = alertStats?.filter(a => a.status === 'sent').length || 0;
    const highPriorityAlerts = alertStats?.filter(a => a.priority === 'high').length || 0;

    // Calculate alerts by time period
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const alertsLast7Days = alertStats?.filter(a => new Date(a.created_at) > last7Days).length || 0;

    res.json({
      statistics: {
        total_alerts: totalAlerts,
        unread_alerts: unreadAlerts,
        high_priority_alerts: highPriorityAlerts,
        alerts_last_7_days: alertsLast7Days,
        response_rate: totalAlerts > 0 ? ((totalAlerts - unreadAlerts) / totalAlerts * 100).toFixed(1) : 0
      },
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Statistics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirm_email } = req.body;

    if (confirm_email !== req.user.email) {
      return res.status(400).json({ error: 'Email confirmation required' });
    }

    // Soft delete - mark as inactive instead of hard delete
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Delete account error:', error);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
