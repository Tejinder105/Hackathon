import express from 'express';
import BlueGuardAIIntegration from '../services/aiIntegration.js';

const router = express.Router();
const aiIntegration = new BlueGuardAIIntegration();

// Get AI service health status
router.get('/health', async (req, res) => {
  try {
    await aiIntegration.checkAIServiceHealth();
    res.json({
      status: 'healthy',
      ai_service_available: aiIntegration.isAIServiceAvailable,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      ai_service_available: false
    });
  }
});

// Storm surge prediction endpoint
router.post('/predict/storm-surge', async (req, res) => {
  try {
    const { weather_data } = req.body;
    
    if (!weather_data) {
      return res.status(400).json({
        error: 'Weather data is required',
        required_fields: ['wind_speed', 'pressure', 'tide_height', 'wave_height', 'temperature']
      });
    }

    const prediction = await aiIntegration.predictStormSurge(weather_data);
    
    res.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Storm surge prediction error:', error);
    res.status(500).json({
      error: 'Storm surge prediction failed',
      message: error.message
    });
  }
});

// Coastal erosion prediction endpoint
router.post('/predict/coastal-erosion', async (req, res) => {
  try {
    const { coastal_data } = req.body;
    
    if (!coastal_data) {
      return res.status(400).json({
        error: 'Coastal data is required',
        required_fields: ['wave_energy', 'sediment_type', 'vegetation_cover', 'slope_angle', 'storm_frequency']
      });
    }

    const prediction = await aiIntegration.predictCoastalErosion(coastal_data);
    
    res.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Coastal erosion prediction error:', error);
    res.status(500).json({
      error: 'Coastal erosion prediction failed',
      message: error.message
    });
  }
});

// Blue carbon threat prediction endpoint
router.post('/predict/blue-carbon', async (req, res) => {
  try {
    const { ecosystem_data } = req.body;
    
    if (!ecosystem_data) {
      return res.status(400).json({
        error: 'Ecosystem data is required',
        required_fields: ['water_quality', 'pollution_levels', 'human_activity', 'climate_factors', 'biodiversity_index']
      });
    }

    const prediction = await aiIntegration.predictBlueCarbonThreat(ecosystem_data);
    
    res.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Blue carbon prediction error:', error);
    res.status(500).json({
      error: 'Blue carbon prediction failed',
      message: error.message
    });
  }
});

// Weather prediction endpoint
router.post('/predict/weather', async (req, res) => {
  try {
    const { historical_data, hours = 24 } = req.body;
    
    if (!historical_data || !Array.isArray(historical_data)) {
      return res.status(400).json({
        error: 'Historical weather data array is required',
        required_format: 'Array of objects with temperature, pressure, wind_speed'
      });
    }

    const prediction = await aiIntegration.predictWeather(historical_data);
    
    res.json({
      success: true,
      prediction,
      forecast_hours: hours,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Weather prediction error:', error);
    res.status(500).json({
      error: 'Weather prediction failed',
      message: error.message
    });
  }
});

// Comprehensive threat analysis endpoint
router.post('/analyze/comprehensive', async (req, res) => {
  try {
    const inputData = req.body;
    
    if (!inputData || Object.keys(inputData).length === 0) {
      return res.status(400).json({
        error: 'Input data is required',
        expected_structure: {
          weather: 'Weather conditions object',
          coastal: 'Coastal conditions object',
          ecosystem: 'Ecosystem data object',
          historical_weather: 'Array of historical weather data'
        }
      });
    }

    const analysis = await aiIntegration.comprehensiveAnalysis(inputData);
    
    // Log analysis for monitoring
    console.log(`Comprehensive analysis completed: ${analysis.overall_risk} risk level`);
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    res.status(500).json({
      error: 'Comprehensive analysis failed',
      message: error.message
    });
  }
});

// Model retraining endpoint (admin only)
router.post('/retrain', async (req, res) => {
  try {
    // In production, add authentication middleware
    const result = await aiIntegration.retrainModels();
    
    res.json({
      success: true,
      message: 'Model retraining initiated',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model retraining error:', error);
    res.status(500).json({
      error: 'Model retraining failed',
      message: error.message
    });
  }
});

// Get AI model performance metrics
router.get('/metrics', async (req, res) => {
  try {
    // This would fetch actual metrics from the AI service
    // For now, returning mock metrics
    const metrics = {
      storm_surge_model: {
        accuracy: 0.87,
        rmse: 0.23,
        last_trained: new Date(Date.now() - 86400000).toISOString(),
        predictions_made: 1542
      },
      coastal_erosion_model: {
        accuracy: 0.82,
        f1_score: 0.79,
        last_trained: new Date(Date.now() - 86400000).toISOString(),
        predictions_made: 987
      },
      blue_carbon_model: {
        accuracy: 0.85,
        f1_score: 0.83,
        last_trained: new Date(Date.now() - 86400000).toISOString(),
        predictions_made: 756
      },
      weather_model: {
        mae: 2.1,
        rmse: 3.4,
        last_trained: new Date(Date.now() - 86400000).toISOString(),
        predictions_made: 2345
      }
    };

    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Metrics retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error.message
    });
  }
});

// Bulk prediction endpoint for batch processing
router.post('/predict/batch', async (req, res) => {
  try {
    const { predictions } = req.body;
    
    if (!predictions || !Array.isArray(predictions)) {
      return res.status(400).json({
        error: 'Predictions array is required',
        format: 'Array of prediction requests with type and data'
      });
    }

    const results = [];
    
    for (const predictionRequest of predictions) {
      const { type, data } = predictionRequest;
      let result = { type, success: false };
      
      try {
        switch (type) {
          case 'storm_surge':
            result.prediction = await aiIntegration.predictStormSurge(data);
            result.success = true;
            break;
          case 'coastal_erosion':
            result.prediction = await aiIntegration.predictCoastalErosion(data);
            result.success = true;
            break;
          case 'blue_carbon':
            result.prediction = await aiIntegration.predictBlueCarbonThreat(data);
            result.success = true;
            break;
          case 'weather':
            result.prediction = await aiIntegration.predictWeather(data);
            result.success = true;
            break;
          default:
            result.error = `Unknown prediction type: ${type}`;
        }
      } catch (error) {
        result.error = error.message;
      }
      
      results.push(result);
    }

    res.json({
      success: true,
      results,
      total_predictions: predictions.length,
      successful_predictions: results.filter(r => r.success).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Batch prediction error:', error);
    res.status(500).json({
      error: 'Batch prediction failed',
      message: error.message
    });
  }
});

export default router;
