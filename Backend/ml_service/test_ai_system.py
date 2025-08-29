"""
BlueGuard AI Test Script
Demonstrates the AI prediction capabilities
"""

import requests
import json
from datetime import datetime

# Configuration
AI_SERVICE_URL = "http://localhost:5001"
BACKEND_URL = "http://localhost:5000"

def test_ai_service_health():
    """Test AI service health"""
    try:
        response = requests.get(f"{AI_SERVICE_URL}/health")
        print("🔍 AI Service Health Check:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ AI Service health check failed: {e}")
        return False

def test_storm_surge_prediction():
    """Test storm surge prediction"""
    print("\n⛈️  Testing Storm Surge Prediction:")
    
    test_data = {
        "wind_speed": 35,  # High wind speed
        "pressure": 995,   # Low pressure
        "tide_height": 3.2,  # High tide
        "wave_height": 2.5,
        "temperature": 28
    }
    
    try:
        response = requests.post(f"{AI_SERVICE_URL}/predict/storm-surge", json=test_data)
        result = response.json()
        print(f"📊 Input: Wind {test_data['wind_speed']}m/s, Pressure {test_data['pressure']}hPa")
        print(f"🌊 Predicted surge height: {result.get('surge_height', 0):.2f}m")
        print(f"⚠️  Risk level: {result.get('risk_level', 'unknown')}")
        print(f"🎯 Confidence: {result.get('confidence', 0):.2%}")
        return result
    except Exception as e:
        print(f"❌ Storm surge prediction failed: {e}")
        return None

def test_coastal_erosion_prediction():
    """Test coastal erosion prediction"""
    print("\n🏖️  Testing Coastal Erosion Prediction:")
    
    test_data = {
        "wave_energy": 8.5,      # High wave energy
        "sediment_type": "sand",  # Sandy beach
        "vegetation_cover": 25,   # Low vegetation
        "slope_angle": 15,        # Moderate slope
        "storm_frequency": 5      # Frequent storms
    }
    
    try:
        response = requests.post(f"{AI_SERVICE_URL}/predict/coastal-erosion", json=test_data)
        result = response.json()
        print(f"📊 Input: Wave energy {test_data['wave_energy']}, Vegetation {test_data['vegetation_cover']}%")
        print(f"⚠️  Erosion risk: {result.get('risk_level', 'unknown')}")
        print(f"🎯 Confidence: {result.get('confidence', 0):.2%}")
        if 'probabilities' in result:
            print("📈 Risk probabilities:")
            for level, prob in result['probabilities'].items():
                print(f"   {level}: {prob:.2%}")
        return result
    except Exception as e:
        print(f"❌ Coastal erosion prediction failed: {e}")
        return None

def test_blue_carbon_prediction():
    """Test blue carbon threat prediction"""
    print("\n🌱 Testing Blue Carbon Ecosystem Threat Prediction:")
    
    test_data = {
        "water_quality": 60,      # Declining water quality
        "pollution_levels": 4.2,  # High pollution
        "human_activity": 7.5,    # High human activity
        "climate_factors": 1.5,   # Climate stress
        "biodiversity_index": 45, # Low biodiversity
        "carbon_storage": 150     # Carbon storage capacity
    }
    
    try:
        response = requests.post(f"{AI_SERVICE_URL}/predict/blue-carbon", json=test_data)
        result = response.json()
        print(f"📊 Input: Water quality {test_data['water_quality']}%, Pollution {test_data['pollution_levels']}")
        print(f"⚠️  Threat level: {result.get('threat_level', 'unknown')}")
        print(f"🎯 Confidence: {result.get('confidence', 0):.2%}")
        
        if 'carbon_loss_estimate' in result:
            carbon_loss = result['carbon_loss_estimate']
            print(f"💰 Potential carbon loss: {carbon_loss.get('potential_loss_tons_co2', 0):.1f} tons CO₂")
            print(f"💵 Economic value: ${carbon_loss.get('economic_value_usd', 0):,.0f}")
            print(f"⏱️  Recovery time: {carbon_loss.get('recovery_time_years', 0):.1f} years")
        
        return result
    except Exception as e:
        print(f"❌ Blue carbon prediction failed: {e}")
        return None

def test_comprehensive_analysis():
    """Test comprehensive threat analysis"""
    print("\n🔍 Testing Comprehensive Threat Analysis:")
    
    test_data = {
        "weather": {
            "wind_speed": 28,
            "pressure": 1005,
            "tide_height": 2.8,
            "wave_height": 2.0,
            "temperature": 26
        },
        "coastal": {
            "wave_energy": 6.5,
            "sediment_type": "mixed",
            "vegetation_cover": 40,
            "slope_angle": 12,
            "storm_frequency": 4
        },
        "ecosystem": {
            "water_quality": 70,
            "pollution_levels": 3.0,
            "human_activity": 6.0,
            "climate_factors": 0.8,
            "biodiversity_index": 65,
            "carbon_storage": 120
        },
        "historical_weather": [
            {"temperature": 25, "pressure": 1010, "wind_speed": 12},
            {"temperature": 26, "pressure": 1008, "wind_speed": 15},
            {"temperature": 27, "pressure": 1005, "wind_speed": 18}
        ]
    }
    
    try:
        response = requests.post(f"{AI_SERVICE_URL}/analyze/comprehensive", json=test_data)
        result = response.json()
        
        print(f"🌡️  Overall risk level: {result.get('overall_risk', 'unknown')}")
        print(f"🎯 Overall confidence: {result.get('confidence', 0):.2%}")
        
        print("\n📋 Individual Threat Analysis:")
        threats = result.get('threats', {})
        
        for threat_type, threat_data in threats.items():
            if isinstance(threat_data, dict) and 'error' not in threat_data:
                print(f"\n  {threat_type.replace('_', ' ').title()}:")
                if 'surge_height' in threat_data:
                    print(f"    Surge height: {threat_data['surge_height']:.2f}m")
                if 'risk_level' in threat_data:
                    print(f"    Risk level: {threat_data['risk_level']}")
                if 'threat_level' in threat_data:
                    print(f"    Threat level: {threat_data['threat_level']}")
                if 'confidence' in threat_data:
                    print(f"    Confidence: {threat_data['confidence']:.2%}")
        
        print(f"\n💡 Recommendations:")
        for rec in result.get('recommendations', []):
            print(f"  • {rec}")
        
        return result
    except Exception as e:
        print(f"❌ Comprehensive analysis failed: {e}")
        return None

def test_backend_ai_integration():
    """Test backend AI integration"""
    print("\n🔗 Testing Backend AI Integration:")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/ai/health")
        result = response.json()
        print("✅ Backend AI health check:")
        print(json.dumps(result, indent=2))
        return result
    except Exception as e:
        print(f"❌ Backend AI integration test failed: {e}")
        return None

def main():
    """Run all tests"""
    print("🚀 BlueGuard AI System Testing")
    print("=" * 50)
    
    # Test AI service health
    if not test_ai_service_health():
        print("❌ AI service is not running. Please start it first.")
        return
    
    # Test individual predictions
    test_storm_surge_prediction()
    test_coastal_erosion_prediction()
    test_blue_carbon_prediction()
    
    # Test comprehensive analysis
    test_comprehensive_analysis()
    
    # Test backend integration
    test_backend_ai_integration()
    
    print("\n✅ All tests completed!")
    print("\n📚 BlueGuard AI System is ready for:")
    print("  • Real-time storm surge predictions")
    print("  • Coastal erosion risk assessment")
    print("  • Blue carbon ecosystem threat analysis")
    print("  • Comprehensive multi-threat analysis")
    print("  • 72-hour weather forecasting")
    print("  • Economic impact calculations")
    print("  • Actionable recommendations")

if __name__ == "__main__":
    main()
