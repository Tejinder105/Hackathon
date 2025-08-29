import axios from 'axios';

class BlueGuardAIIntegration {
  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    this.isAIServiceAvailable = false;
    this.checkAIServiceHealth();
  }

  async checkAIServiceHealth() {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`);
      this.isAIServiceAvailable = response.data.models_loaded;
      console.log('AI Service Status:', response.data);
    } catch (error) {
      console.error('AI Service unavailable:', error.message);
      this.isAIServiceAvailable = false;
    }
  }

  async predictStormSurge(weatherData) {
    try {
      if (!this.isAIServiceAvailable) {
        return this.getFallbackStormSurgeAnalysis(weatherData);
      }

      const response = await axios.post(`${this.aiServiceUrl}/predict/storm-surge`, weatherData);
      return {
        surge_height: response.data.surge_height,
        confidence: response.data.confidence,
        risk_level: response.data.risk_level,
        source: 'ai_model'
      };
    } catch (error) {
      console.error('Storm surge prediction error:', error.message);
      return this.getFallbackStormSurgeAnalysis(weatherData);
    }
  }

  async predictCoastalErosion(coastalData) {
    try {
      if (!this.isAIServiceAvailable) {
        return this.getFallbackErosionAnalysis(coastalData);
      }

      const response = await axios.post(`${this.aiServiceUrl}/predict/coastal-erosion`, coastalData);
      return {
        risk_level: response.data.risk_level,
        confidence: response.data.confidence,
        probabilities: response.data.probabilities,
        source: 'ai_model'
      };
    } catch (error) {
      console.error('Coastal erosion prediction error:', error.message);
      return this.getFallbackErosionAnalysis(coastalData);
    }
  }

  async predictBlueCarbonThreat(ecosystemData) {
    try {
      if (!this.isAIServiceAvailable) {
        return this.getFallbackBlueCarbonAnalysis(ecosystemData);
      }

      const response = await axios.post(`${this.aiServiceUrl}/predict/blue-carbon`, ecosystemData);
      return {
        threat_level: response.data.threat_level,
        confidence: response.data.confidence,
        probabilities: response.data.probabilities,
        carbon_loss_estimate: response.data.carbon_loss_estimate,
        source: 'ai_model'
      };
    } catch (error) {
      console.error('Blue carbon prediction error:', error.message);
      return this.getFallbackBlueCarbonAnalysis(ecosystemData);
    }
  }

  async predictWeather(historicalData) {
    try {
      if (!this.isAIServiceAvailable) {
        return this.getFallbackWeatherPrediction(historicalData);
      }

      const response = await axios.post(`${this.aiServiceUrl}/predict/weather`, {
        historical_data: historicalData
      });
      return {
        predictions: response.data.predictions,
        confidence: response.data.confidence,
        source: 'ai_model'
      };
    } catch (error) {
      console.error('Weather prediction error:', error.message);
      return this.getFallbackWeatherPrediction(historicalData);
    }
  }

  async comprehensiveAnalysis(inputData) {
    try {
      if (!this.isAIServiceAvailable) {
        return await this.getFallbackComprehensiveAnalysis(inputData);
      }

      const response = await axios.post(`${this.aiServiceUrl}/analyze/comprehensive`, inputData);
      return {
        ...response.data,
        source: 'ai_model'
      };
    } catch (error) {
      console.error('Comprehensive analysis error:', error.message);
      return await this.getFallbackComprehensiveAnalysis(inputData);
    }
  }

  // Fallback methods for when AI service is unavailable
  getFallbackStormSurgeAnalysis(weatherData) {
    const windSpeed = weatherData.wind_speed || 10;
    const pressure = weatherData.pressure || 1013;
    const tideHeight = weatherData.tide_height || 2.0;

    // Simple rule-based calculation
    let surgeHeight = 0;
    
    if (windSpeed > 25) surgeHeight += 0.8;
    else if (windSpeed > 15) surgeHeight += 0.4;
    
    if (pressure < 1000) surgeHeight += 0.6;
    else if (pressure < 1010) surgeHeight += 0.3;
    
    if (tideHeight > 3.0) surgeHeight += 0.5;
    else if (tideHeight > 2.5) surgeHeight += 0.2;

    let riskLevel = 'low';
    if (surgeHeight > 1.5) riskLevel = 'critical';
    else if (surgeHeight > 1.0) riskLevel = 'high';
    else if (surgeHeight > 0.5) riskLevel = 'medium';

    return {
      surge_height: Math.max(0, surgeHeight),
      confidence: 0.7,
      risk_level: riskLevel,
      source: 'rule_based'
    };
  }

  getFallbackErosionAnalysis(coastalData) {
    const waveEnergy = coastalData.wave_energy || 5;
    const vegetationCover = coastalData.vegetation_cover || 50;
    const stormFrequency = coastalData.storm_frequency || 3;

    let riskScore = 0;
    riskScore += waveEnergy / 10;
    riskScore += (100 - vegetationCover) / 100;
    riskScore += stormFrequency / 5;

    let riskLevel = 'low';
    if (riskScore > 2.5) riskLevel = 'critical';
    else if (riskScore > 2.0) riskLevel = 'high';
    else if (riskScore > 1.5) riskLevel = 'medium';

    return {
      risk_level: riskLevel,
      confidence: 0.6,
      probabilities: {
        low: riskLevel === 'low' ? 0.8 : 0.2,
        medium: riskLevel === 'medium' ? 0.8 : 0.2,
        high: riskLevel === 'high' ? 0.8 : 0.2,
        critical: riskLevel === 'critical' ? 0.8 : 0.2
      },
      source: 'rule_based'
    };
  }

  getFallbackBlueCarbonAnalysis(ecosystemData) {
    const waterQuality = ecosystemData.water_quality || 75;
    const pollutionLevels = ecosystemData.pollution_levels || 2;
    const humanActivity = ecosystemData.human_activity || 5;
    const biodiversityIndex = ecosystemData.biodiversity_index || 70;

    let threatScore = 0;
    threatScore += (100 - waterQuality) / 100;
    threatScore += pollutionLevels / 5;
    threatScore += humanActivity / 10;
    threatScore += (100 - biodiversityIndex) / 100;

    let threatLevel = 'minimal';
    if (threatScore > 2.5) threatLevel = 'severe';
    else if (threatScore > 2.0) threatLevel = 'significant';
    else if (threatScore > 1.5) threatLevel = 'moderate';

    const carbonStorage = ecosystemData.carbon_storage || 100;
    const lossMultipliers = { minimal: 0.05, moderate: 0.15, significant: 0.35, severe: 0.60 };
    const carbonLoss = carbonStorage * lossMultipliers[threatLevel];

    return {
      threat_level: threatLevel,
      confidence: 0.6,
      probabilities: {
        minimal: threatLevel === 'minimal' ? 0.8 : 0.2,
        moderate: threatLevel === 'moderate' ? 0.8 : 0.2,
        significant: threatLevel === 'significant' ? 0.8 : 0.2,
        severe: threatLevel === 'severe' ? 0.8 : 0.2
      },
      carbon_loss_estimate: {
        potential_loss_tons_co2: carbonLoss,
        economic_value_usd: carbonLoss * 50,
        recovery_time_years: carbonLoss / 10
      },
      source: 'rule_based'
    };
  }

  getFallbackWeatherPrediction(historicalData) {
    const recentData = historicalData.slice(-24) || [];
    const avgTemp = recentData.length > 0 
      ? recentData.reduce((sum, d) => sum + (d.temperature || 25), 0) / recentData.length
      : 25;

    const predictions = [];
    for (let i = 1; i <= 24; i++) {
      const tempVariation = (Math.random() - 0.5) * 4; // ±2°C variation
      const dailyCycle = 3 * Math.sin(2 * Math.PI * i / 24); // Daily temperature cycle
      
      predictions.push({
        timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
        temperature: avgTemp + tempVariation + dailyCycle,
        hour_offset: i
      });
    }

    return {
      predictions,
      confidence: 0.5,
      source: 'rule_based'
    };
  }

  async getFallbackComprehensiveAnalysis(inputData) {
    const results = {
      timestamp: new Date().toISOString(),
      overall_risk: 'low',
      confidence: 0.6,
      threats: {},
      source: 'rule_based'
    };

    if (inputData.weather) {
      results.threats.storm_surge = this.getFallbackStormSurgeAnalysis(inputData.weather);
    }

    if (inputData.coastal) {
      results.threats.coastal_erosion = this.getFallbackErosionAnalysis(inputData.coastal);
    }

    if (inputData.ecosystem) {
      results.threats.blue_carbon = this.getFallbackBlueCarbonAnalysis(inputData.ecosystem);
    }

    if (inputData.historical_weather) {
      results.threats.weather_forecast = this.getFallbackWeatherPrediction(inputData.historical_weather);
    }

    // Calculate overall risk
    const riskScores = { low: 1, minimal: 1, medium: 2, moderate: 2, high: 3, significant: 3, critical: 4, severe: 4 };
    const scores = [];
    
    Object.values(results.threats).forEach(threat => {
      if (threat.risk_level) scores.push(riskScores[threat.risk_level] || 2);
      if (threat.threat_level) scores.push(riskScores[threat.threat_level] || 2);
    });

    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b) / scores.length;
      if (avgScore < 1.5) results.overall_risk = 'low';
      else if (avgScore < 2.5) results.overall_risk = 'medium';
      else if (avgScore < 3.5) results.overall_risk = 'high';
      else results.overall_risk = 'critical';
    }

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results.threats);

    return results;
  }

  generateRecommendations(threats) {
    const recommendations = [];

    Object.entries(threats).forEach(([threatType, threatData]) => {
      if (threatType === 'storm_surge' && threatData.surge_height > 1.0) {
        recommendations.push('Issue storm surge warning - evacuate low-lying areas');
        recommendations.push('Deploy emergency response teams');
      }
      
      if (threatType === 'coastal_erosion' && ['high', 'critical'].includes(threatData.risk_level)) {
        recommendations.push('Implement emergency coastal protection measures');
        recommendations.push('Restrict beach access in high-risk areas');
      }
      
      if (threatType === 'blue_carbon' && ['significant', 'severe'].includes(threatData.threat_level)) {
        recommendations.push('Activate blue carbon ecosystem protection protocols');
        recommendations.push('Deploy rapid response conservation team');
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Continue routine monitoring');
      recommendations.push('Maintain current alert status');
    }

    return recommendations;
  }

  async retrainModels() {
    try {
      if (!this.isAIServiceAvailable) {
        throw new Error('AI service not available for retraining');
      }

      const response = await axios.post(`${this.aiServiceUrl}/retrain`);
      console.log('Model retraining completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('Model retraining error:', error.message);
      throw error;
    }
  }
}

export default BlueGuardAIIntegration;
