import { useState, useEffect } from 'react';
import socketService from '../services/socket';
import { useNotification } from '../context/NotificationContext';

export const useRealTimeThreats = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showThreatAlert } = useNotification();

  useEffect(() => {
    // Handle new threats
    const handleNewThreat = (threat) => {
      setThreats(prev => [threat, ...prev]);
      showThreatAlert(threat);
    };

    // Handle threat updates
    const handleThreatUpdate = (updatedThreat) => {
      setThreats(prev => 
        prev.map(threat => 
          threat.id === updatedThreat.id ? updatedThreat : threat
        )
      );
    };

    // Subscribe to real-time events
    socketService.on('threat:new', handleNewThreat);
    socketService.on('threat:updated', handleThreatUpdate);

    setLoading(false);

    // Cleanup
    return () => {
      socketService.off('threat:new', handleNewThreat);
      socketService.off('threat:updated', handleThreatUpdate);
    };
  }, [showThreatAlert]);

  const addThreat = (threat) => {
    setThreats(prev => [threat, ...prev]);
  };

  const updateThreat = (threatId, updates) => {
    setThreats(prev => 
      prev.map(threat => 
        threat.id === threatId ? { ...threat, ...updates } : threat
      )
    );
  };

  const removeThreat = (threatId) => {
    setThreats(prev => prev.filter(threat => threat.id !== threatId));
  };

  return {
    threats,
    loading,
    addThreat,
    updateThreat,
    removeThreat,
    setThreats
  };
};

export const useRealTimeAlerts = (userId) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showInfo } = useNotification();

  useEffect(() => {
    // Handle new alerts
    const handleNewAlert = (alert) => {
      setAlerts(prev => [alert, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (alert.priority === 'high') {
        showInfo(`High priority alert: ${alert.title}`, 8000);
      }
    };

    // Subscribe to real-time events
    socketService.on('alert:new', handleNewAlert);

    // Cleanup
    return () => {
      socketService.off('alert:new', handleNewAlert);
    };
  }, [showInfo]);

  const markAsRead = (alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'read' } : alert
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, status: 'read' }))
    );
    setUnreadCount(0);
  };

  const addAlert = (alert) => {
    setAlerts(prev => [alert, ...prev]);
    if (alert.status === 'sent') {
      setUnreadCount(prev => prev + 1);
    }
  };

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addAlert,
    setAlerts,
    setUnreadCount
  };
};

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    socketId: null,
    transport: null,
    reconnectAttempts: 0
  });

  useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(socketService.getConnectionStatus());
    };

    // Update status when socket connects/disconnects
    socketService.on('connect', updateStatus);
    socketService.on('disconnect', updateStatus);

    // Initial status
    updateStatus();

    // Cleanup
    return () => {
      socketService.off('connect', updateStatus);
      socketService.off('disconnect', updateStatus);
    };
  }, []);

  return connectionStatus;
};
