import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(userId) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to OceanEye real-time service');
      this.isConnected = true;
      
      if (userId) {
        this.socket.emit('join_alerts', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time service');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();

    return this.socket;
  }

  setupEventListeners() {
    // New threat detected
    this.socket.on('new_threat', (threat) => {
      console.log('🚨 New threat detected:', threat);
      this.emit('threat:new', threat);
    });

    // Threat updated
    this.socket.on('threat_updated', (threat) => {
      console.log('🔄 Threat updated:', threat);
      this.emit('threat:updated', threat);
    });

    // New alert
    this.socket.on('new_alert', (alert) => {
      console.log('🔔 New alert received:', alert);
      this.emit('alert:new', alert);
    });

    // System status updates
    this.socket.on('system_status', (status) => {
      console.log('📊 System status update:', status);
      this.emit('system:status', status);
    });
  }

  // Event emitter pattern
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Join specific rooms
  joinAlerts(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_alerts', userId);
    }
  }

  // Send custom events
  sendEvent(eventName, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      transport: this.socket?.io?.engine?.transport?.name || null
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
