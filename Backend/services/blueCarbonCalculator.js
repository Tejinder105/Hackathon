// Blue carbon calculation and impact assessment service

export const calculateBlueCarbon = async (locationId) => {
  try {
    // Mock blue carbon data for MVP - in production would use real ecosystem data
    const habitatData = getHabitatData(locationId);
    
    const blueCarbonMetrics = {
      total_area_hectares: habitatData.area,
      habitat_breakdown: habitatData.habitats,
      carbon_storage: calculateCarbonStorage(habitatData),
      sequestration_rate: calculateSequestrationRate(habitatData),
      economic_value: calculateEconomicValue(habitatData),
      health_status: assessHealthStatus(habitatData),
      threats: identifyThreats(locationId),
      conservation_priority: calculateConservationPriority(habitatData)
    };

    return blueCarbonMetrics;

  } catch (error) {
    console.error('Blue carbon calculation error:', error);
    return {
      total_area_hectares: 0,
      habitat_breakdown: {},
      carbon_storage: { total_tons: 0 },
      sequestration_rate: { annual_tons: 0 },
      economic_value: { total_usd: 0 },
      health_status: 'unknown',
      threats: [],
      conservation_priority: 'medium',
      error: 'Calculation failed'
    };
  }
};

// Get habitat data for location (mock for MVP)
const getHabitatData = (locationId) => {
  const locations = {
    '1': { // Manila Bay
      area: 150,
      habitats: {
        mangrove: 80,
        seagrass: 50,
        salt_marsh: 20
      },
      degradation_rate: 0.02, // 2% per year
      restoration_potential: 0.8
    },
    '2': { // Cebu
      area: 95,
      habitats: {
        mangrove: 45,
        seagrass: 35,
        salt_marsh: 15
      },
      degradation_rate: 0.015,
      restoration_potential: 0.9
    },
    '3': { // Davao
      area: 200,
      habitats: {
        mangrove: 120,
        seagrass: 60,
        salt_marsh: 20
      },
      degradation_rate: 0.01,
      restoration_potential: 0.95
    }
  };

  return locations[locationId] || {
    area: 100,
    habitats: {
      mangrove: 60,
      seagrass: 30,
      salt_marsh: 10
    },
    degradation_rate: 0.02,
    restoration_potential: 0.7
  };
};

// Calculate total carbon storage
const calculateCarbonStorage = (habitatData) => {
  // Carbon storage rates per hectare by habitat type (tons CO2)
  const storageRates = {
    mangrove: 400, // Very high carbon storage
    seagrass: 150, // Moderate storage
    salt_marsh: 200 // High storage
  };

  let totalStorage = 0;
  const breakdown = {};

  for (const [habitat, area] of Object.entries(habitatData.habitats)) {
    const storage = area * (storageRates[habitat] || 100);
    breakdown[habitat] = {
      area_hectares: area,
      storage_tons_co2: storage
    };
    totalStorage += storage;
  }

  return {
    total_tons: Math.round(totalStorage),
    breakdown,
    per_hectare_average: Math.round(totalStorage / habitatData.area)
  };
};

// Calculate annual sequestration rate
const calculateSequestrationRate = (habitatData) => {
  // Annual sequestration rates per hectare (tons CO2/year)
  const sequestrationRates = {
    mangrove: 1.5,
    seagrass: 0.8,
    salt_marsh: 1.2
  };

  let totalSequestration = 0;
  const breakdown = {};

  for (const [habitat, area] of Object.entries(habitatData.habitats)) {
    const sequestration = area * (sequestrationRates[habitat] || 1.0);
    breakdown[habitat] = {
      area_hectares: area,
      annual_sequestration_tons: sequestration
    };
    totalSequestration += sequestration;
  }

  return {
    annual_tons: Math.round(totalSequestration * 10) / 10,
    breakdown,
    projected_10_years: Math.round(totalSequestration * 10)
  };
};

// Calculate economic value
const calculateEconomicValue = (habitatData) => {
  const carbonPrice = 50; // $50 per ton CO2
  const ecosystemServiceMultiplier = 3; // Additional ecosystem services value

  const carbonStorage = calculateCarbonStorage(habitatData);
  const sequestration = calculateSequestrationRate(habitatData);

  const carbonValue = carbonStorage.total_tons * carbonPrice;
  const annualSequestrationValue = sequestration.annual_tons * carbonPrice;
  const ecosystemServicesValue = carbonValue * ecosystemServiceMultiplier;

  return {
    total_usd: Math.round(carbonValue + ecosystemServicesValue),
    breakdown: {
      carbon_storage_value: carbonValue,
      ecosystem_services_value: ecosystemServicesValue,
      annual_sequestration_value: annualSequestrationValue
    },
    per_hectare_value: Math.round((carbonValue + ecosystemServicesValue) / habitatData.area)
  };
};

// Assess habitat health status
const assessHealthStatus = (habitatData) => {
  const degradationRate = habitatData.degradation_rate || 0.02;
  const restorationPotential = habitatData.restoration_potential || 0.5;

  if (degradationRate > 0.03) {
    return 'critical';
  } else if (degradationRate > 0.02) {
    return 'poor';
  } else if (degradationRate > 0.01) {
    return 'fair';
  } else if (restorationPotential > 0.8) {
    return 'excellent';
  } else {
    return 'good';
  }
};

// Identify threats to blue carbon ecosystems
const identifyThreats = (locationId) => {
  // Common threats by location (mock data)
  const commonThreats = [
    {
      type: 'coastal_development',
      severity: 'high',
      impact: 'Habitat loss and fragmentation',
      mitigation: 'Enforce marine protected areas'
    },
    {
      type: 'pollution',
      severity: 'medium',
      impact: 'Water quality degradation',
      mitigation: 'Improve waste management systems'
    },
    {
      type: 'climate_change',
      severity: 'high',
      impact: 'Sea level rise and temperature increase',
      mitigation: 'Implement adaptation strategies'
    },
    {
      type: 'overfishing',
      severity: 'medium',
      impact: 'Ecosystem imbalance',
      mitigation: 'Sustainable fishing practices'
    }
  ];

  // Location-specific threats
  const locationThreats = {
    '1': [ // Manila Bay
      {
        type: 'urban_runoff',
        severity: 'high',
        impact: 'Nutrient pollution and eutrophication',
        mitigation: 'Urban planning and green infrastructure'
      }
    ],
    '2': [ // Cebu
      {
        type: 'tourism_pressure',
        severity: 'medium',
        impact: 'Physical damage and pollution',
        mitigation: 'Sustainable tourism practices'
      }
    ],
    '3': [ // Davao
      {
        type: 'aquaculture',
        severity: 'medium',
        impact: 'Habitat conversion and water quality',
        mitigation: 'Sustainable aquaculture standards'
      }
    ]
  };

  return [
    ...commonThreats,
    ...(locationThreats[locationId] || [])
  ];
};

// Calculate conservation priority score
const calculateConservationPriority = (habitatData) => {
  const sequestration = calculateSequestrationRate(habitatData);
  const degradationRate = habitatData.degradation_rate || 0.02;
  const restorationPotential = habitatData.restoration_potential || 0.5;

  // Priority scoring factors
  let score = 0;
  
  // High sequestration rate increases priority
  if (sequestration.annual_tons > 100) score += 30;
  else if (sequestration.annual_tons > 50) score += 20;
  else score += 10;

  // High degradation rate increases urgency
  if (degradationRate > 0.03) score += 40;
  else if (degradationRate > 0.02) score += 30;
  else if (degradationRate > 0.01) score += 20;
  else score += 10;

  // High restoration potential increases opportunity
  score += restorationPotential * 30;

  // Determine priority level
  if (score >= 80) return 'critical';
  else if (score >= 60) return 'high';
  else if (score >= 40) return 'medium';
  else return 'low';
};

// Calculate carbon offset potential
export const calculateCarbonOffset = (areaHectares, habitatType = 'mangrove', years = 10) => {
  const sequestrationRates = {
    mangrove: 1.5,
    seagrass: 0.8,
    salt_marsh: 1.2
  };

  const annualSequestration = areaHectares * (sequestrationRates[habitatType] || 1.0);
  const totalSequestration = annualSequestration * years;
  const economicValue = totalSequestration * 50; // $50 per ton CO2

  return {
    area_hectares: areaHectares,
    habitat_type: habitatType,
    years,
    annual_sequestration_tons: annualSequestration,
    total_sequestration_tons: totalSequestration,
    economic_value_usd: economicValue,
    equivalent_cars_removed: Math.round(totalSequestration / 4.6) // Average car emits 4.6 tons CO2/year
  };
};

// Generate blue carbon report
export const generateBlueCarbonReport = async (locationId) => {
  try {
    const metrics = await calculateBlueCarbon(locationId);
    const recommendations = generateConservationRecommendations(metrics);

    return {
      location_id: locationId,
      assessment_date: new Date().toISOString(),
      metrics,
      recommendations,
      summary: {
        key_findings: [
          `Total carbon storage: ${metrics.carbon_storage.total_tons} tons CO2`,
          `Annual sequestration: ${metrics.sequestration_rate.annual_tons} tons CO2/year`,
          `Economic value: $${metrics.economic_value.total_usd.toLocaleString()}`,
          `Health status: ${metrics.health_status}`
        ],
        priority_actions: recommendations.slice(0, 3)
      }
    };

  } catch (error) {
    console.error('Blue carbon report generation error:', error);
    throw error;
  }
};

// Generate conservation recommendations
const generateConservationRecommendations = (metrics) => {
  const recommendations = [];

  // Health-based recommendations
  switch (metrics.health_status) {
    case 'critical':
      recommendations.push(
        'Immediate intervention required - implement emergency protection measures',
        'Establish marine protected area with strict enforcement',
        'Begin urgent restoration activities'
      );
      break;
    case 'poor':
      recommendations.push(
        'Implement comprehensive restoration program',
        'Reduce pollution sources and human pressure',
        'Monitor ecosystem health monthly'
      );
      break;
    case 'fair':
      recommendations.push(
        'Strengthen existing protection measures',
        'Implement sustainable use practices',
        'Enhance monitoring and early warning systems'
      );
      break;
    default:
      recommendations.push(
        'Maintain current protection levels',
        'Continue monitoring and adaptive management',
        'Explore restoration opportunities'
      );
  }

  // Threat-specific recommendations
  metrics.threats.forEach(threat => {
    if (threat.severity === 'high') {
      recommendations.push(threat.mitigation);
    }
  });

  return recommendations;
};
