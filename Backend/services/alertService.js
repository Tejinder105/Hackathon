// Alert service for sending notifications through various channels

export const sendAlert = async (alert, channels = ['app']) => {
  try {
    const results = [];

    for (const channel of channels) {
      switch (channel) {
        case 'email':
          results.push(await sendEmailAlert(alert));
          break;
        case 'sms':
          results.push(await sendSMSAlert(alert));
          break;
        case 'app':
          results.push(await sendAppNotification(alert));
          break;
        case 'webhook':
          results.push(await sendWebhookAlert(alert));
          break;
        default:
          console.warn(`Unknown alert channel: ${channel}`);
      }
    }

    return {
      success: true,
      channels_sent: channels,
      results
    };

  } catch (error) {
    console.error('Alert sending error:', error);
    throw error;
  }
};

// Send email alert (mock implementation for MVP)
const sendEmailAlert = async (alert) => {
  try {
    // Mock email sending - in production would use SendGrid, AWS SES, etc.
    console.log(`📧 Email Alert Sent:
      To: ${alert.users?.email}
      Subject: ${alert.title}
      Body: ${alert.message}
    `);

    // Simulate email delivery delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      channel: 'email',
      status: 'sent',
      timestamp: new Date().toISOString(),
      recipient: alert.users?.email
    };

  } catch (error) {
    console.error('Email alert error:', error);
    return {
      channel: 'email',
      status: 'failed',
      error: error.message
    };
  }
};

// Send SMS alert (mock implementation for MVP)
const sendSMSAlert = async (alert) => {
  try {
    // Mock SMS sending - in production would use Twilio, AWS SNS, etc.
    console.log(`📱 SMS Alert Sent:
      To: ${alert.users?.phone || 'No phone number'}
      Message: ${alert.title} - ${alert.message}
    `);

    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      channel: 'sms',
      status: 'sent',
      timestamp: new Date().toISOString(),
      recipient: alert.users?.phone || 'unknown'
    };

  } catch (error) {
    console.error('SMS alert error:', error);
    return {
      channel: 'sms',
      status: 'failed',
      error: error.message
    };
  }
};

// Send in-app notification
const sendAppNotification = async (alert) => {
  try {
    console.log(`🔔 App Notification:
      User: ${alert.users?.full_name}
      Alert: ${alert.title}
      Priority: ${alert.priority}
    `);

    return {
      channel: 'app',
      status: 'sent',
      timestamp: new Date().toISOString(),
      recipient: alert.user_id
    };

  } catch (error) {
    console.error('App notification error:', error);
    return {
      channel: 'app',
      status: 'failed',
      error: error.message
    };
  }
};

// Send webhook alert (for integrations)
const sendWebhookAlert = async (alert) => {
  try {
    // Mock webhook - in production would POST to configured URLs
    const webhookPayload = {
      alert_id: alert.id,
      title: alert.title,
      message: alert.message,
      priority: alert.priority,
      threat_type: alert.threats?.threat_type,
      severity: alert.threats?.severity_score,
      timestamp: alert.created_at
    };

    console.log(`🔗 Webhook Alert Sent:
      Payload: ${JSON.stringify(webhookPayload, null, 2)}
    `);

    return {
      channel: 'webhook',
      status: 'sent',
      timestamp: new Date().toISOString(),
      payload: webhookPayload
    };

  } catch (error) {
    console.error('Webhook alert error:', error);
    return {
      channel: 'webhook',
      status: 'failed',
      error: error.message
    };
  }
};

// Generate stakeholder-specific alert messages
export const generateStakeholderAlert = (threat, userRole) => {
  const baseAlert = {
    threat_id: threat.id,
    title: `${threat.threat_type.replace('_', ' ').toUpperCase()} Alert`,
    priority: threat.severity_score > 7 ? 'high' : threat.severity_score > 4 ? 'medium' : 'low',
    channels: ['app', 'email']
  };

  switch (userRole) {
    case 'disaster_management':
      return {
        ...baseAlert,
        title: `🚨 EMERGENCY: ${baseAlert.title}`,
        message: `Immediate action required for ${threat.threat_type} with severity ${threat.severity_score}/10. 
                 Location: ${threat.threat_locations?.name}
                 Detected: ${new Date(threat.detected_at).toLocaleString()}
                 Recommended actions: Activate emergency protocols, deploy response teams.`,
        channels: ['app', 'email', 'sms']
      };

    case 'city_government':
      return {
        ...baseAlert,
        title: `🏛️ Infrastructure Alert: ${baseAlert.title}`,
        message: `Coastal threat detected affecting municipal infrastructure. 
                 Threat: ${threat.threat_type} (Severity: ${threat.severity_score}/10)
                 Location: ${threat.threat_locations?.name}
                 Recommended: Review emergency budgets, coordinate with emergency services.`,
        channels: ['app', 'email']
      };

    case 'environmental_ngo':
      return {
        ...baseAlert,
        title: `🌿 Ecosystem Alert: ${baseAlert.title}`,
        message: `Blue carbon ecosystem threat detected!
                 Threat: ${threat.threat_type} (Severity: ${threat.severity_score}/10)
                 Location: ${threat.threat_locations?.name}
                 Potential impact: Habitat damage, carbon loss
                 Action needed: Mobilize conservation response, document impact.`,
        channels: ['app', 'email']
      };

    case 'fisherfolk':
      return {
        ...baseAlert,
        title: `🎣 Safety Alert: ${baseAlert.title}`,
        message: `FISHING SAFETY WARNING: ${threat.threat_type} detected in your area.
                 Severity: ${threat.severity_score}/10
                 Location: ${threat.threat_locations?.name}
                 Recommendation: Avoid fishing in affected areas, seek safe harbor.
                 Stay safe and monitor updates.`,
        channels: ['app', 'sms']
      };

    case 'civil_defence':
      return {
        ...baseAlert,
        title: `🚑 Civil Defence Alert: ${baseAlert.title}`,
        message: `Multi-agency coordination required for ${threat.threat_type}.
                 Severity: ${threat.severity_score}/10
                 Location: ${threat.threat_locations?.name}
                 Actions: Coordinate response, prepare public alerts, liaise with emergency services.`,
        channels: ['app', 'email', 'webhook']
      };

    default:
      return {
        ...baseAlert,
        message: `Coastal threat alert: ${threat.threat_type} detected at ${threat.threat_locations?.name}.
                 Severity level: ${threat.severity_score}/10
                 Please stay informed and follow safety guidelines.
                 Time: ${new Date(threat.detected_at).toLocaleString()}`
      };
  }
};

// Batch send alerts to multiple users
export const sendBatchAlerts = async (threat, users) => {
  try {
    const results = [];

    for (const user of users) {
      const alertConfig = generateStakeholderAlert(threat, user.role);
      
      try {
        const result = await sendAlert({
          ...alertConfig,
          user_id: user.id,
          users: user
        }, alertConfig.channels);
        
        results.push({
          user_id: user.id,
          status: 'sent',
          channels: alertConfig.channels,
          result
        });
      } catch (error) {
        results.push({
          user_id: user.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      total_users: users.length,
      successful_sends: results.filter(r => r.status === 'sent').length,
      failed_sends: results.filter(r => r.status === 'failed').length,
      results
    };

  } catch (error) {
    console.error('Batch alert sending error:', error);
    throw error;
  }
};

// Schedule periodic alert checks
export const scheduleAlertChecks = () => {
  // This would run periodically to check for new threats and send alerts
  console.log('🔄 Alert monitoring system activated');
  
  // In production, this would use cron jobs or scheduled functions
  setInterval(async () => {
    try {
      console.log('⏰ Running periodic alert check...');
      // Check for new threats and send alerts
      // Implementation would query database for new threats and send appropriate alerts
    } catch (error) {
      console.error('Periodic alert check error:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};
