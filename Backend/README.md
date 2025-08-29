# 🌊 OceanEye Backend

AI-Powered Coastal Threat Detection & Blue Carbon Protection System - Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)
- API keys for external services (optional for demo)

### Installation

1. **Clone and setup:**
```bash
cd Backend
npm install
```

2. **Environment Setup:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
notepad .env  # or your preferred editor
```

3. **Configure Supabase:**
   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and anon key to `.env`
   - Run the database schema in Supabase SQL editor (see `database/schema.sql`)

4. **Start the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

## 🔧 Configuration

### Required Environment Variables

```env
# Basic Configuration
NODE_ENV=development
PORT=5000

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# JWT Secret (Required)
JWT_SECRET=your_complex_jwt_secret_here

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# External APIs (Optional - demo data used if not provided)
OPENWEATHER_API_KEY=your_openweather_key
NASA_API_KEY=your_nasa_key
```

### External API Setup (Optional)

1. **OpenWeatherMap** (Free tier: 1000 calls/day)
   - Sign up at https://openweathermap.org/api
   - Add API key to `.env`

2. **NASA APIs** (Free)
   - Sign up at https://api.nasa.gov/
   - Add API key to `.env`

## 📊 Database Setup

### Supabase Setup

1. Create new project at https://supabase.com
2. Go to SQL Editor
3. Copy and run the schema from `database/schema.sql`
4. Enable Real-time for `threats` and `alerts` tables
5. Copy project credentials to `.env`

### Schema Overview

```
📋 Main Tables:
├── users (Authentication & profiles)
├── user_preferences (Alert settings)
├── threat_locations (Monitoring locations)
├── threats (Detected threats)
├── threat_impacts (Economic/carbon impact)
├── alerts (User notifications)
└── blue_carbon_habitats (Ecosystem data)
```

## 🛠 API Endpoints

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/verify      # Token verification
```

### Threats
```
GET    /api/threats                    # List all threats
GET    /api/threats/:id               # Get threat details
POST   /api/threats                   # Create threat (manual report)
PATCH  /api/threats/:id/status        # Update threat status
GET    /api/threats/predictions/forecast  # 72-hour predictions
GET    /api/threats/stats/summary     # Threat statistics
```

### Alerts
```
GET    /api/alerts              # List user alerts
GET    /api/alerts/:id         # Get alert details
POST   /api/alerts             # Create alert
PATCH  /api/alerts/:id/read    # Mark as read
PATCH  /api/alerts/bulk/read   # Bulk mark as read
GET    /api/alerts/stats/:user_id  # Alert statistics
DELETE /api/alerts/:id         # Delete alert
```

### Dashboard
```
GET /api/dashboard/overview          # Main dashboard data
GET /api/dashboard/timeline          # Threat timeline (7 days)
GET /api/dashboard/location/:id      # Location-specific data
GET /api/dashboard/economic-impact   # Economic impact analysis
```

### Users (Protected)
```
GET    /api/users/profile       # Get user profile
PATCH  /api/users/profile       # Update profile
GET    /api/users/preferences   # Get preferences
PUT    /api/users/preferences   # Update preferences
GET    /api/users/activity      # User activity log
GET    /api/users/statistics    # User statistics
DELETE /api/users/account       # Delete account
```

## 🧠 AI & Data Services

### Threat Analysis Engine
- **Location**: `services/aiAnalysis.js`
- **Features**: 
  - Weather pattern analysis
  - Tide risk assessment
  - 72-hour threat predictions
  - Confidence scoring
  - Blue carbon impact analysis

### External Data Integration
- **Location**: `services/externalApis.js`
- **Sources**:
  - OpenWeatherMap (weather data)
  - NOAA (tide data - mock in MVP)
  - NASA (satellite data - mock in MVP)

### Blue Carbon Calculator
- **Location**: `services/blueCarbonCalculator.js`
- **Features**:
  - Carbon storage calculation
  - Sequestration rate analysis
  - Economic valuation
  - Conservation priority scoring

## 🔄 Real-time Features

### WebSocket Events
```javascript
// Client connects to Socket.IO
socket.emit('join_alerts', userId);

// Server events
socket.on('new_threat', threat => {
  // New threat detected
});

socket.on('new_alert', alert => {
  // Alert for user
});

socket.on('threat_updated', threat => {
  // Threat status changed
});
```

### Background Monitoring
- **Frequency**: Every 15 minutes
- **Locations**: All active monitoring locations
- **Processing**: Automated threat detection and alert generation

## 🎯 Stakeholder-Specific Features

### Disaster Management
- Emergency-level alerts
- Resource deployment recommendations
- Multi-channel notifications (SMS, email, app)

### Environmental NGOs
- Blue carbon impact assessments
- Conservation priority scoring
- Donor impact metrics

### Fisherfolk Communities
- Safety-focused alerts
- Local language support
- Weather and tide information

### City Government
- Infrastructure vulnerability mapping
- Budget impact analysis
- Long-term planning data

### Civil Defence
- Multi-agency coordination
- Public alert management
- Resource allocation optimization

## 📈 Monitoring & Analytics

### Health Check
```bash
GET /health
```

### System Statistics
```bash
GET /api/dashboard/overview?user_role=disaster_management
```

### Performance Monitoring
- Response time tracking
- API usage statistics
- Error rate monitoring
- Real-time threat detection metrics

## 🧪 Testing & Development

### Demo Mode
The system includes demo data and simulated threats for testing:

```javascript
// Simulated threats occur every 5 minutes (30% probability)
// Mock weather data when API keys not provided
// Sample blue carbon habitats included
```

### Development Commands
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start
npm test         # Run tests (when implemented)
```

## 🚀 Deployment

### Quick Deploy Options

1. **Railway** (Recommended for hackathons)
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway deploy
   ```

2. **Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Heroku**
   ```bash
   # Create Heroku app
   heroku create oceaneye-backend
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your_url
   # ... other env vars
   
   # Deploy
   git push heroku main
   ```

### Environment Variables for Production
```bash
# Set all required environment variables
# Ensure JWT_SECRET is complex and secure
# Use production Supabase instance
# Enable all monitoring and logging
```

## 🔒 Security

### Implemented Security Measures
- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js security headers
- CORS configuration
- Input validation
- Rate limiting (can be added)
- Row Level Security (RLS) in Supabase

### Production Security Checklist
- [ ] Strong JWT secret
- [ ] HTTPS only
- [ ] Environment variables secured
- [ ] Database connection encrypted
- [ ] API rate limiting enabled
- [ ] Monitoring and alerting setup

## 🤝 Integration

### Frontend Integration
```javascript
// React frontend connection
const API_BASE = 'http://localhost:5000/api';

// Authentication
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Real-time connection
import io from 'socket.io-client';
const socket = io('http://localhost:5000');
socket.emit('join_alerts', userId);
```

### External System Integration
- Webhook support for external alerts
- REST API for third-party integrations
- Real-time data feeds via WebSocket

## 📋 TODO for Production

### High Priority
- [ ] Implement comprehensive testing
- [ ] Add API rate limiting
- [ ] Set up logging and monitoring
- [ ] Implement caching (Redis)
- [ ] Add data validation schemas
- [ ] Set up automated backups

### Medium Priority
- [ ] Implement advanced ML models
- [ ] Add more external data sources
- [ ] Implement push notifications
- [ ] Add API documentation (Swagger)
- [ ] Set up CI/CD pipeline

### Future Enhancements
- [ ] Mobile app backend features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced AI threat prediction
- [ ] Integration with more external APIs

## 🆘 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   ```
   Check SUPABASE_URL and SUPABASE_ANON_KEY in .env
   Verify database schema is properly imported
   ```

2. **CORS Issues**
   ```
   Update FRONTEND_URL in .env
   Check CORS configuration in server.js
   ```

3. **Authentication Issues**
   ```
   Verify JWT_SECRET is set
   Check token format in requests
   ```

## 📞 Support

For hackathon support or questions:
- Check the logs for detailed error messages
- Verify all environment variables are set
- Ensure Supabase database schema is imported
- Test API endpoints with Postman or similar tool

---

## 🏆 Hackathon Success Tips

1. **Quick Setup**: Use demo mode first, add real APIs later
2. **Focus on MVP**: Core features work out of the box
3. **Showcase Real-time**: Demonstrate live threat detection
4. **Emphasize Impact**: Use blue carbon metrics for compelling demo
5. **Stakeholder Stories**: Show different user experiences

**Happy Hacking! 🌊🚀**
