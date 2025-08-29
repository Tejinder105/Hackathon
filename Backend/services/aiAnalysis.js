// AI-powered threat analysis service
// This is a simplified implementation for MVP - in production would use ML models

export const analyzeThreat = async (threatData) => {
  try {
    const analysis = {
      threat_level: 'medium',
      confidence: 0.8,
      predictions: [],
      recommendations: [],
      risk_factors: []
    };

    // Analyze weather conditions
    const weatherRisk = analyzeWeatherRisk(threatData.weather);
    analysis.risk_factors.push(...weatherRisk.factors);

    // Analyze tide conditions
    const tideRisk = analyzeTideRisk(threatData.tides);
    analysis.risk_factors.push(...tideRisk.factors);

    // Generate 72-hour predictions
    analysis.predictions = generatePredictions(threatData);

    // Calculate overall threat level
    analysis.threat_level = calculateThreatLevel(analysis.risk_factors);
    analysis.confidence = calculateConfidence(threatData);

    // Generate recommendations
    analysis.recommendations = generateRecommendations(analysis.threat_level, analysis.risk_factors);

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
