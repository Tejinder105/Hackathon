"""
BlueGuard AI Prediction Service (Simplified)
Flask API service for real-time threat predictions using traditional ML
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import json
import os
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class BlueGuardPredictorSimplified:
    def __init__(self):
        self.models_path = 'models/'
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.models_loaded = False
        self.load_models()
    
    def load_models(self):
        """Load all trained models"""
        try:
            # Try loading existing models
            if self.load_saved_models():
                self.models_loaded = True
                logger.info("Saved models loaded successfully")
            else:
                # Train new models if none exist
                logger.warning("No saved models found. Training new models...")
                self.train_models()
                self.models_loaded = True
                logger.info("New models trained and loaded")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            self.models_loaded = False
    
    def load_saved_models(self):
        """Load models from disk"""
        try:
            # Check if model files exist
            model_files = ['storm_surge_model.joblib', 'coastal_erosion_model.joblib', 'blue_carbon_threat_model.joblib']
            
            if not all(os.path.exists(f'{self.models_path}{file}') for file in model_files):
                return False
            
            # Load models
            self.models['storm_surge'] = joblib.load(f'{self.models_path}storm_surge_model.joblib')
            self.models['coastal_erosion'] = joblib.load(f'{self.models_path}coastal_erosion_model.joblib')
            self.models['blue_carbon_threat'] = joblib.load(f'{self.models_path}blue_carbon_threat_model.joblib')
            
            # Load preprocessors
            if os.path.exists(f'{self.models_path}scalers.joblib'):
                self.scalers = joblib.load(f'{self.models_path}scalers.joblib')
            
            if os.path.exists(f'{self.models_path}encoders.joblib'):
                self.encoders = joblib.load(f'{self.models_path}encoders.joblib')
            
            return True
            
        except Exception as e:
            logger.error(f"Error loading saved models: {e}")
            return False
    
    def train_models(self):
        """Train new models if none exist"""
        try:
            from train_models_simple import BlueGuardAITrainerSimplified
            trainer = BlueGuardAITrainerSimplified(models_path=self.models_path)
            trainer.train_all_models()
            trainer.save_models()
            
            # Load the newly trained models
            self.models = trainer.models
            self.scalers = trainer.scalers
            self.encoders = trainer.encoders
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            raise e
    
    def predict_storm_surge(self, weather_data):
        """Predict storm surge height"""
        try:
            if 'storm_surge' not in self.models:
                return {"error": "Storm surge model not available", "surge_height": 0}
            
            # Prepare input data
            features = np.array([[
                weather_data.get('wind_speed', 10),
                weather_data.get('pressure', 1013),
                weather_data.get('tide_height', 2.0),
                weather_data.get('wave_height', 1.0),
                weather_data.get('temperature', 25)
            ]])
            
            # Scale features
            scaler = self.scalers.get('storm_surge_scaler')
            if scaler:
                features = scaler.transform(features)
            
            # Predict
            model = self.models['storm_surge']
            surge_height = model.predict(features)[0]
            
            # Calculate confidence based on input data quality
            confidence = min(0.95, 0.6 + (weather_data.get('wind_speed', 10) / 50) * 0.3)
            
            return {
                "surge_height": float(max(0, surge_height)),
                "confidence": float(confidence),
                "risk_level": self._categorize_surge_risk(surge_height)
            }
            
        except Exception as e:
            logger.error(f"Storm surge prediction error: {e}")
            return {"error": str(e), "surge_height": 0}
    
    def predict_coastal_erosion(self, coastal_data):
        """Predict coastal erosion risk"""
        try:
            if 'coastal_erosion' not in self.models:
                return {"error": "Erosion model not available", "risk_level": "unknown"}
            
            # Prepare input data
            features = np.array([[
                coastal_data.get('wave_energy', 5),
                self._encode_sediment_type(coastal_data.get('sediment_type', 'sand')),
                coastal_data.get('vegetation_cover', 50),
                coastal_data.get('slope_angle', 10),
                coastal_data.get('storm_frequency', 3)
            ]])
            
            # Scale features
            scaler = self.scalers.get('coastal_erosion_scaler')
            if scaler:
                features = scaler.transform(features)
            
            # Predict
            model = self.models['coastal_erosion']
            
            # Get probabilities if available
            if hasattr(model, 'predict_proba'):
                risk_probabilities = model.predict_proba(features)[0]
                risk_levels = ['low', 'medium', 'high', 'critical']
                confidence = float(np.max(risk_probabilities))
                probabilities = {level: float(prob) for level, prob in zip(risk_levels, risk_probabilities)}
            else:
                probabilities = {}
                confidence = 0.7
            
            risk_level = model.predict(features)[0]
            
            return {
                "risk_level": risk_level,
                "confidence": confidence,
                "probabilities": probabilities
            }
            
        except Exception as e:
            logger.error(f"Erosion prediction error: {e}")
            return {"error": str(e), "risk_level": "unknown"}
    
    def predict_blue_carbon_threat(self, ecosystem_data):
        """Predict blue carbon ecosystem threat level"""
        try:
            if 'blue_carbon_threat' not in self.models:
                return {"error": "Blue carbon model not available", "threat_level": "unknown"}
            
            # Prepare input data
            features = np.array([[
                ecosystem_data.get('water_quality', 75),
                ecosystem_data.get('pollution_levels', 2),
                ecosystem_data.get('human_activity', 5),
                ecosystem_data.get('climate_factors', 0),
                ecosystem_data.get('biodiversity_index', 70)
            ]])
            
            # Scale features
            scaler = self.scalers.get('blue_carbon_threat_scaler')
            if scaler:
                features = scaler.transform(features)
            
            # Predict
            model = self.models['blue_carbon_threat']
            
            # Get probabilities if available
            if hasattr(model, 'predict_proba'):
                threat_probabilities = model.predict_proba(features)[0]
                threat_levels = ['minimal', 'moderate', 'significant', 'severe']
                confidence = float(np.max(threat_probabilities))
                probabilities = {level: float(prob) for level, prob in zip(threat_levels, threat_probabilities)}
            else:
                probabilities = {}
                confidence = 0.7
            
            threat_level = model.predict(features)[0]
            
            # Calculate carbon loss estimate
            carbon_loss = self._estimate_carbon_loss(threat_level, ecosystem_data)
            
            return {
                "threat_level": threat_level,
                "confidence": confidence,
                "probabilities": probabilities,
                "carbon_loss_estimate": carbon_loss
            }
            
        except Exception as e:
            logger.error(f"Blue carbon prediction error: {e}")
            return {"error": str(e), "threat_level": "unknown"}
    
    def predict_weather_sequence(self, historical_data):
        """Simple weather prediction based on trends"""
        try:
            if not historical_data or len(historical_data) == 0:
                historical_data = [{"temperature": 25, "pressure": 1013, "wind_speed": 10}]
            
            # Simple trend-based prediction
            recent_data = historical_data[-24:] if len(historical_data) >= 24 else historical_data
            avg_temp = sum(d.get('temperature', 25) for d in recent_data) / len(recent_data)
            
            predictions = []
            now = datetime.now()
            
            for i in range(1, 25):  # Next 24 hours
                # Simple trend with some variation
                temp_variation = (np.random.random() - 0.5) * 4  # ±2°C
                daily_cycle = 3 * np.sin(2 * np.pi * i / 24)  # Daily cycle
                
                predictions.append({
                    "timestamp": (now + timedelta(hours=i)).isoformat(),
                    "temperature": float(avg_temp + temp_variation + daily_cycle),
                    "hour_offset": i
                })
            
            return {
                "predictions": predictions,
                "confidence": 0.6  # Lower confidence for simple model
            }
            
        except Exception as e:
            logger.error(f"Weather prediction error: {e}")
            return {"error": str(e)}
    
    def comprehensive_threat_analysis(self, input_data):
        """Perform comprehensive threat analysis"""
        results = {
            "timestamp": datetime.now().isoformat(),
            "overall_risk": "low",
            "confidence": 0.7,
            "threats": {}
        }
        
        try:
            # Storm surge analysis
            if 'weather' in input_data:
                results['threats']['storm_surge'] = self.predict_storm_surge(input_data['weather'])
            
            # Coastal erosion analysis
            if 'coastal' in input_data:
                results['threats']['coastal_erosion'] = self.predict_coastal_erosion(input_data['coastal'])
            
            # Blue carbon threat analysis
            if 'ecosystem' in input_data:
                results['threats']['blue_carbon'] = self.predict_blue_carbon_threat(input_data['ecosystem'])
            
            # Weather prediction
            if 'historical_weather' in input_data:
                results['threats']['weather_forecast'] = self.predict_weather_sequence(input_data['historical_weather'])
            
            # Calculate overall risk
            results['overall_risk'] = self._calculate_overall_risk(results['threats'])
            
            # Generate recommendations
            results['recommendations'] = self._generate_recommendations(results['threats'])
            
            return results
            
        except Exception as e:
            logger.error(f"Comprehensive analysis error: {e}")
            results['error'] = str(e)
            return results
    
    def _encode_sediment_type(self, sediment_type):
        """Encode sediment type for model input"""
        mapping = {'sand': 0, 'clay': 1, 'rock': 2, 'mixed': 3}
        return mapping.get(sediment_type.lower(), 0)
    
    def _categorize_surge_risk(self, surge_height):
        """Categorize surge height into risk levels"""
        if surge_height < 0.5:
            return "low"
        elif surge_height < 1.0:
            return "medium"
        elif surge_height < 2.0:
            return "high"
        else:
            return "critical"
    
    def _estimate_carbon_loss(self, threat_level, ecosystem_data):
        """Estimate potential carbon loss"""
        base_carbon = ecosystem_data.get('carbon_storage', 100)
        
        loss_multipliers = {
            'minimal': 0.05,
            'moderate': 0.15,
            'significant': 0.35,
            'severe': 0.60
        }
        
        loss_rate = loss_multipliers.get(threat_level, 0.25)
        carbon_loss = base_carbon * loss_rate
        
        return {
            "potential_loss_tons_co2": float(carbon_loss),
            "economic_value_usd": float(carbon_loss * 50),
            "recovery_time_years": float(carbon_loss / 10)
        }
    
    def _calculate_overall_risk(self, threats):
        """Calculate overall risk level"""
        risk_scores = {
            'low': 1, 'minimal': 1,
            'medium': 2, 'moderate': 2,
            'high': 3, 'significant': 3,
            'critical': 4, 'severe': 4
        }
        
        scores = []
        for threat_type, threat_data in threats.items():
            if isinstance(threat_data, dict) and 'error' not in threat_data:
                if 'risk_level' in threat_data:
                    scores.append(risk_scores.get(threat_data['risk_level'], 2))
                elif 'threat_level' in threat_data:
                    scores.append(risk_scores.get(threat_data['threat_level'], 2))
        
        if not scores:
            return "unknown"
        
        avg_score = np.mean(scores)
        if avg_score < 1.5:
            return "low"
        elif avg_score < 2.5:
            return "medium"
        elif avg_score < 3.5:
            return "high"
        else:
            return "critical"
    
    def _generate_recommendations(self, threats):
        """Generate actionable recommendations"""
        recommendations = []
        
        for threat_type, threat_data in threats.items():
            if isinstance(threat_data, dict) and 'error' not in threat_data:
                if threat_type == 'storm_surge':
                    surge_height = threat_data.get('surge_height', 0)
                    if surge_height > 1.0:
                        recommendations.append("Issue storm surge warning - evacuate low-lying areas")
                    elif surge_height > 0.5:
                        recommendations.append("Monitor coastal conditions closely")
                
                elif threat_type == 'coastal_erosion':
                    risk_level = threat_data.get('risk_level', 'low')
                    if risk_level in ['high', 'critical']:
                        recommendations.append("Implement emergency coastal protection measures")
                
                elif threat_type == 'blue_carbon':
                    threat_level = threat_data.get('threat_level', 'minimal')
                    if threat_level in ['significant', 'severe']:
                        recommendations.append("Activate blue carbon ecosystem protection protocols")
        
        if not recommendations:
            recommendations.append("Continue routine monitoring")
        
        return recommendations

# Initialize predictor
predictor = BlueGuardPredictorSimplified()

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": predictor.models_loaded,
        "available_models": list(predictor.models.keys()),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict/storm-surge', methods=['POST'])
def predict_storm_surge():
    """Predict storm surge height"""
    try:
        data = request.get_json()
        result = predictor.predict_storm_surge(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/coastal-erosion', methods=['POST'])
def predict_coastal_erosion():
    """Predict coastal erosion risk"""
    try:
        data = request.get_json()
        result = predictor.predict_coastal_erosion(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/blue-carbon', methods=['POST'])
def predict_blue_carbon():
    """Predict blue carbon ecosystem threats"""
    try:
        data = request.get_json()
        result = predictor.predict_blue_carbon_threat(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict/weather', methods=['POST'])
def predict_weather():
    """Predict weather for next 24 hours"""
    try:
        data = request.get_json()
        result = predictor.predict_weather_sequence(data.get('historical_data', []))
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze/comprehensive', methods=['POST'])
def comprehensive_analysis():
    """Perform comprehensive threat analysis"""
    try:
        data = request.get_json()
        result = predictor.comprehensive_threat_analysis(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/retrain', methods=['POST'])
def retrain_models():
    """Retrain models"""
    try:
        predictor.train_models()
        return jsonify({
            "status": "success",
            "message": "Models retrained successfully",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting BlueGuard AI Prediction Service (Simplified)...")
    print("Available endpoints:")
    print("- POST /predict/storm-surge")
    print("- POST /predict/coastal-erosion") 
    print("- POST /predict/blue-carbon")
    print("- POST /predict/weather")
    print("- POST /analyze/comprehensive")
    print("- GET /health")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
