// AI-powered threat analysis service using BlueGuard ML models
import BlueGuardAIIntegration from './aiIntegration.js';

const aiIntegration = new BlueGuardAIIntegration();

export const analyzeThreat = async (threatData) => {
  try {
    // Prepare comprehensive input data for AI analysis
    const aiInputData = {
      weather: threatData.weather?.current ? {
        wind_speed: threatData.weather.current.wind_speed || 10,
        pressure: threatData.weather.current.pressure || 1013,
        temperature: threatData.weather.current.temperature || 25,
        tide_height: threatData.tides?.current_tide?.height_meters || 2.0,
        wave_height: calculateWaveHeight(threatData.weather.current.wind_speed || 10)
      } : null,
      
      coastal: threatData.coastal ? {
        wave_energy: calculateWaveEnergy(threatData.weather?.current?.wind_speed || 10),
        sediment_type: threatData.coastal.sediment_type || 'sand',
        vegetation_cover: threatData.coastal.vegetation_cover || 50,
        slope_angle: threatData.coastal.slope_angle || 10,
        storm_frequency: threatData.coastal.storm_frequency || 3
      } : null,
      
      ecosystem: threatData.ecosystem ? {
        water_quality: threatData.ecosystem.water_quality || 75,
        pollution_levels: threatData.ecosystem.pollution_levels || 2,
        human_activity: threatData.ecosystem.human_activity || 5,
        climate_factors: threatData.ecosystem.climate_factors || 0,
        biodiversity_index: threatData.ecosystem.biodiversity_index || 70,
        carbon_storage: threatData.ecosystem.carbon_storage || 100
      } : null,
      
      historical_weather: threatData.historical_weather || []
    };

    // Get comprehensive AI analysis
    const aiAnalysis = await aiIntegration.comprehensiveAnalysis(aiInputData);

    // Transform AI results to expected format
    const analysis = {
      threat_level: aiAnalysis.overall_risk,
      confidence: aiAnalysis.confidence,
      predictions: await generateEnhancedPredictions(aiAnalysis, threatData),
      recommendations: aiAnalysis.recommendations || [],
      risk_factors: extractRiskFactors(aiAnalysis),
      ai_analysis: aiAnalysis,
      source: aiAnalysis.source
    };

    // Add legacy risk factor analysis for backward compatibility
    if (threatData.weather) {
      const weatherRisk = analyzeWeatherRisk(threatData.weather);
      analysis.risk_factors.push(...weatherRisk.factors);
    }

    if (threatData.tides) {
      const tideRisk = analyzeTideRisk(threatData.tides);
      analysis.risk_factors.push(...tideRisk.factors);
    }

    return analysis;

  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      threat_level: 'unknown',
      confidence: 0.5,
      predictions: [],
      recommendations: ['Monitor conditions closely'],
      risk_factors: ['Analysis temporarily unavailable'],
      error: 'AI analysis failed'
    };
  }
};

// Enhanced prediction generation using AI insights
const generateEnhancedPredictions = async (aiAnalysis, threatData) => {
  const predictions = [];
  const currentTime = new Date();

  // Generate 72-hour predictions
  for (let hour = 1; hour <= 72; hour++) {
    const predictionTime = new Date(currentTime.getTime() + hour * 60 * 60 * 1000);
    
    let threatLevel = 'low';
    let confidence = 0.7;

    // Use AI weather predictions if available
    if (aiAnalysis.threats?.weather_forecast?.predictions) {
      const weatherPred = aiAnalysis.threats.weather_forecast.predictions.find(p => p.hour_offset === hour);
      if (weatherPred) {
        // Adjust threat level based on predicted temperature changes
        const tempChange = Math.abs(weatherPred.temperature - (threatData.weather?.current?.temperature || 25));
        if (tempChange > 10) threatLevel = 'high';
        else if (tempChange > 5) threatLevel = 'medium';
        
        confidence = aiAnalysis.threats.weather_forecast.confidence;
      }
    }

    // Factor in storm surge predictions
    if (aiAnalysis.threats?.storm_surge) {
      const surgeRisk = aiAnalysis.threats.storm_surge.risk_level;
      if (['high', 'critical'].includes(surgeRisk)) {
        threatLevel = surgeRisk;
        confidence = Math.min(confidence, aiAnalysis.threats.storm_surge.confidence);
      }
    }

    predictions.push({
      timestamp: predictionTime.toISOString(),
      threat_level: threatLevel,
      confidence: confidence,
      hour_offset: hour,
      factors: {
        storm_surge: aiAnalysis.threats?.storm_surge?.surge_height || 0,
        erosion_risk: aiAnalysis.threats?.coastal_erosion?.risk_level || 'low',
        blue_carbon_threat: aiAnalysis.threats?.blue_carbon?.threat_level || 'minimal'
      }
    });
  }

  return predictions;
};

// Extract risk factors from AI analysis
const extractRiskFactors = (aiAnalysis) => {
  const riskFactors = [];

  if (aiAnalysis.threats?.storm_surge) {
    const surge = aiAnalysis.threats.storm_surge;
    if (surge.surge_height > 1.0) {
      riskFactors.push(`High storm surge predicted: ${surge.surge_height.toFixed(2)}m`);
    }
    if (surge.risk_level === 'critical') {
      riskFactors.push('Critical storm surge conditions detected');
    }
  }

  if (aiAnalysis.threats?.coastal_erosion) {
    const erosion = aiAnalysis.threats.coastal_erosion;
    if (['high', 'critical'].includes(erosion.risk_level)) {
      riskFactors.push(`${erosion.risk_level.charAt(0).toUpperCase() + erosion.risk_level.slice(1)} coastal erosion risk`);
    }
  }

  if (aiAnalysis.threats?.blue_carbon) {
    const blueCarbon = aiAnalysis.threats.blue_carbon;
    if (['significant', 'severe'].includes(blueCarbon.threat_level)) {
      riskFactors.push(`${blueCarbon.threat_level.charAt(0).toUpperCase() + blueCarbon.threat_level.slice(1)} blue carbon ecosystem threat`);
    }
    if (blueCarbon.carbon_loss_estimate?.potential_loss_tons_co2 > 50) {
      riskFactors.push(`Potential carbon loss: ${blueCarbon.carbon_loss_estimate.potential_loss_tons_co2.toFixed(1)} tons CO₂`);
    }
  }

  return riskFactors;
};

// Helper function to calculate wave height from wind speed
const calculateWaveHeight = (windSpeed) => {
  // Simplified wave height calculation
  return Math.max(0, 0.3 * windSpeed + Math.random() * 0.5);
};

// Helper function to calculate wave energy
const calculateWaveEnergy = (windSpeed) => {
  // Wave energy increases with square of wind speed
  return Math.pow(windSpeed / 10, 2) * 5;
};

// Analyze weather-related risks
const analyzeWeatherRisk = (weather) => {
  const factors = [];
  
  if (!weather?.current) {
    return { level: 'unknown', factors: ['Weather data unavailable'] };
  }

  const { wind_speed, pressure, weather_condition } = weather.current;

  // Wind risk analysis
  if (wind_speed > 25) {
    factors.push('High wind speed detected');
  } else if (wind_speed > 15) {
    factors.push('Moderate wind conditions');
  }

  // Pressure analysis
  if (pressure < 1000) {
    factors.push('Low atmospheric pressure - storm risk');
  } else if (pressure < 1010) {
    factors.push('Falling pressure - weather change expected');
  }

  // Weather condition analysis
  if (['Thunderstorm', 'Rain', 'Storm'].includes(weather_condition)) {
    factors.push('Severe weather conditions present');
  }

  return { factors };
};

// Analyze tide-related risks
const analyzeTideRisk = (tides) => {
  const factors = [];
  
  if (!tides?.current_tide) {
    return { factors: ['Tide data unavailable'] };
  }

  // High tide warning
  if (tides.high_tide_warning) {
    factors.push('High tide warning - flooding risk');
  }

  // Analyze tide height
  if (tides.current_tide.height_meters > 3.0) {
    factors.push('Extremely high tide - coastal flooding risk');
  } else if (tides.current_tide.height_meters > 2.5) {
    factors.push('High tide conditions');
  }

  return { factors };
};

// Generate 72-hour threat predictions
const generatePredictions = (threatData) => {
  const predictions = [];
  
  for (let hour = 0; hour < 72; hour += 6) {
    const prediction = {
      hour_offset: hour,
      datetime: new Date(Date.now() + hour * 60 * 60 * 1000).toISOString(),
      threat_level: 'low',
      probability: 0.1,
      dominant_factors: []
    };

    // Simulate threat progression based on current conditions
    if (threatData.weather?.current?.wind_speed > 20) {
      prediction.threat_level = hour < 24 ? 'high' : 'medium';
      prediction.probability = Math.max(0.1, 0.8 - (hour / 72) * 0.6);
      prediction.dominant_factors.push('High winds');
    }

    if (threatData.tides?.high_tide_warning && hour < 12) {
      prediction.threat_level = 'high';
      prediction.probability = Math.max(prediction.probability, 0.7);
      prediction.dominant_factors.push('High tide');
    }

    // Add environmental degradation factor
    if (hour > 24) {
      prediction.dominant_factors.push('Environmental stress accumulation');
      prediction.probability += 0.1;
    }

    predictions.push(prediction);
  }

  return predictions;
};

// Calculate overall threat level
const calculateThreatLevel = (riskFactors) => {
  const highRiskKeywords = ['high', 'extreme', 'severe', 'flooding', 'storm'];
  const mediumRiskKeywords = ['moderate', 'warning', 'falling', 'conditions'];

  const riskText = riskFactors.join(' ').toLowerCase();
  
  const highRiskCount = highRiskKeywords.reduce((count, keyword) => 
    count + (riskText.includes(keyword) ? 1 : 0), 0);
  
  const mediumRiskCount = mediumRiskKeywords.reduce((count, keyword) => 
    count + (riskText.includes(keyword) ? 1 : 0), 0);

  if (highRiskCount >= 2) return 'high';
  if (highRiskCount >= 1 || mediumRiskCount >= 2) return 'medium';
  return 'low';
};

// Calculate confidence level
const calculateConfidence = (threatData) => {
  let confidence = 0.5; // Base confidence
  
  // Increase confidence based on data availability
  if (threatData.weather?.current) confidence += 0.2;
  if (threatData.tides?.current_tide) confidence += 0.2;
  if (threatData.satellite) confidence += 0.1;
  
  return Math.min(0.95, confidence);
};

// Generate recommendations based on threat analysis
const generateRecommendations = (threatLevel, riskFactors) => {
  const recommendations = [];
  
  switch (threatLevel) {
    case 'high':
      recommendations.push(
        'Activate emergency response protocols',
        'Issue immediate public warnings',
        'Deploy emergency personnel to high-risk areas',
        'Monitor coastal evacuation zones'
      );
      break;
      
    case 'medium':
      recommendations.push(
        'Increase monitoring frequency',
        'Prepare emergency response teams',
        'Issue advisory warnings to stakeholders',
        'Check coastal protection infrastructure'
      );
      break;
      
    case 'low':
      recommendations.push(
        'Continue routine monitoring',
        'Maintain standard alert protocols',
        'Review and update emergency plans'
      );
      break;
      
    default:
      recommendations.push(
        'Insufficient data for specific recommendations',
        'Improve data collection systems',
        'Monitor conditions closely'
      );
  }

  // Add specific recommendations based on risk factors
  const riskText = riskFactors.join(' ').toLowerCase();
  
  if (riskText.includes('wind')) {
    recommendations.push('Secure loose objects and equipment');
  }
  
  if (riskText.includes('tide') || riskText.includes('flood')) {
    recommendations.push('Monitor low-lying coastal areas', 'Check drainage systems');
  }
  
  if (riskText.includes('storm')) {
    recommendations.push('Activate storm surge barriers if available');
  }

  return recommendations;
};

// Blue carbon impact analysis
export const analyzeBlueCarbon = async (threatData, habitatType = 'mangrove') => {
  try {
    const analysis = {
      habitat_type: habitatType,
      current_health: 'good',
      carbon_sequestration_rate: 0,
      area_at_risk: 0,
      potential_carbon_loss: 0,
      recovery_timeline: '2-5 years',
      protection_priority: 'medium'
    };

    // Calculate carbon sequestration rates by habitat type
    const carbonRates = {
      mangrove: 1.5, // tons CO2/hectare/year
      seagrass: 0.8,
      salt_marsh: 1.2
    };

    analysis.carbon_sequestration_rate = carbonRates[habitatType] || 1.0;

    // Assess threat impact on blue carbon
    const threatLevel = calculateThreatLevel(threatData.risk_factors || []);
    
    switch (threatLevel) {
      case 'high':
        analysis.current_health = 'critical';
        analysis.area_at_risk = 25; // hectares
        analysis.potential_carbon_loss = analysis.area_at_risk * analysis.carbon_sequestration_rate * 10; // 10 years worth
        analysis.protection_priority = 'critical';
        analysis.recovery_timeline = '5-10 years';
        break;
        
      case 'medium':
        analysis.current_health = 'stressed';
        analysis.area_at_risk = 10;
        analysis.potential_carbon_loss = analysis.area_at_risk * analysis.carbon_sequestration_rate * 5;
        analysis.protection_priority = 'high';
        analysis.recovery_timeline = '2-5 years';
        break;
        
      default:
        analysis.current_health = 'good';
        analysis.area_at_risk = 2;
        analysis.potential_carbon_loss = analysis.area_at_risk * analysis.carbon_sequestration_rate * 2;
        analysis.protection_priority = 'medium';
        analysis.recovery_timeline = '1-2 years';
    }

    return analysis;

  } catch (error) {
    console.error('Blue carbon analysis error:', error);
    return {
      habitat_type: habitatType,
      current_health: 'unknown',
      carbon_sequestration_rate: 1.0,
      area_at_risk: 0,
      potential_carbon_loss: 0,
      recovery_timeline: 'unknown',
      protection_priority: 'unknown',
      error: 'Analysis failed'
    };
  }
};
