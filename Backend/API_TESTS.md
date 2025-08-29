# 🧪 OceanEye API Testing Guide

## Quick API Tests

Test these endpoints to verify your backend is working:

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. API Overview
```bash
curl http://localhost:5000/
```

### 3. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@oceaneye.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "disaster_management",
    "organization": "Emergency Response Team"
  }'
```

### 4. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@oceaneye.com",
    "password": "password123"
  }'
```

### 5. Get Threats (No Auth Required)
```bash
curl http://localhost:5000/api/threats
```

### 6. Get Dashboard Overview
```bash
curl "http://localhost:5000/api/dashboard/overview?user_role=disaster_management"
```

### 7. Get Threat Predictions
```bash
curl "http://localhost:5000/api/threats/predictions/forecast?location_id=1"
```

### 8. Get Economic Impact
```bash
curl http://localhost:5000/api/dashboard/economic-impact
```

## PowerShell Tests (Windows)

```powershell
# Health Check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# Register User
$body = @{
    email = "test@oceaneye.com"
    password = "password123"
    full_name = "Test User"
    role = "disaster_management"
    organization = "Emergency Response Team"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"

# Get Threats
Invoke-RestMethod -Uri "http://localhost:5000/api/threats"
```

## JavaScript Tests (Browser Console)

```javascript
// Health Check
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log);

// Register User
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@oceaneye.com',
    password: 'password123',
    full_name: 'Test User',
    role: 'disaster_management',
    organization: 'Emergency Response Team'
  })
})
.then(r => r.json())
.then(console.log);

// Get Dashboard
fetch('http://localhost:5000/api/dashboard/overview?user_role=disaster_management')
  .then(r => r.json())
  .then(console.log);
```

## WebSocket Test (Browser)

```html
<!DOCTYPE html>
<html>
<head><title>OceanEye WebSocket Test</title></head>
<body>
  <div id="output"></div>
  <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
  <script>
    const socket = io('http://localhost:5000');
    const output = document.getElementById('output');
    
    socket.on('connect', () => {
      output.innerHTML += '<p>Connected to OceanEye!</p>';
      socket.emit('join_alerts', 'test-user-123');
    });
    
    socket.on('new_threat', (threat) => {
      output.innerHTML += `<p>🚨 New Threat: ${threat.threat_type}</p>`;
    });
    
    socket.on('new_alert', (alert) => {
      output.innerHTML += `<p>🔔 Alert: ${alert.title}</p>`;
    });
  </script>
</body>
</html>
```

## Expected Sample Responses

### Health Check Response
```json
{
  "status": "OK",
  "timestamp": "2025-08-30T...",
  "service": "OceanEye Backend",
  "version": "1.0.0"
}
```

### Threats Response
```json
{
  "threats": [],
  "count": 0,
  "timestamp": "2025-08-30T..."
}
```

### Dashboard Response
```json
{
  "overview": {
    "active_threats": 0,
    "recent_alerts": 0,
    "avg_severity": 0,
    "threat_distribution": {},
    "blue_carbon": {
      "total_area_hectares": 100,
      "carbon_storage": { "total_tons": 36000 },
      "economic_value": { "total_usd": 144000 }
    }
  },
  "role_specific": {
    "emergency_response_time": "12 minutes",
    "resources_deployed": 8
  }
}
```

Save this as `api-tests.md` for quick reference during development!
