import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, mean_squared_error
import xgboost as xgb
import joblib
import json
import os
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class BlueGuardAITrainerSimplified:
    """
    Simplified BlueGuard AI training system without deep learning
    Uses traditional ML models for faster setup and training
    """
    
    def __init__(self, data_path='data/', models_path='models/'):
        self.data_path = data_path
        self.models_path = models_path
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        
        # Create directories if they don't exist
        os.makedirs(data_path, exist_ok=True)
        os.makedirs(models_path, exist_ok=True)
        
        # Model configurations
        self.model_configs = {
            'storm_surge': {
                'type': 'regression',
                'features': ['wind_speed', 'pressure', 'tide_height', 'wave_height', 'temperature'],
                'target': 'surge_height'
            },
            'coastal_erosion': {
                'type': 'classification',
                'features': ['wave_energy', 'sediment_type', 'vegetation_cover', 'slope_angle', 'storm_frequency'],
                'target': 'erosion_risk_level'
            },
            'blue_carbon_threat': {
                'type': 'multiclass',
                'features': ['water_quality', 'pollution_levels', 'human_activity', 'climate_factors', 'biodiversity_index'],
                'target': 'threat_category'
            }
        }
    
    def generate_synthetic_data(self, threat_type, num_samples=5000):
        """Generate synthetic training data"""
        np.random.seed(42)
        
        if threat_type == 'storm_surge':
            data = self._generate_storm_surge_data(num_samples)
        elif threat_type == 'coastal_erosion':
            data = self._generate_erosion_data(num_samples)
        elif threat_type == 'blue_carbon_threat':
            data = self._generate_blue_carbon_data(num_samples)
        
        return data
    
    def _generate_storm_surge_data(self, num_samples):
        """Generate synthetic storm surge data"""
        data = {}
        
        # Weather features
        data['wind_speed'] = np.random.gamma(2, 5, num_samples)
        data['pressure'] = np.random.normal(1013, 15, num_samples)
        data['temperature'] = np.random.normal(25, 8, num_samples)
        
        # Ocean features
        data['tide_height'] = np.random.normal(2.0, 0.8, num_samples)
        data['wave_height'] = 0.3 * data['wind_speed'] + np.random.normal(0, 0.5, num_samples)
        
        # Calculate surge height based on physical relationships
        surge_base = (data['wind_speed'] / 10) ** 2 * 0.1
        surge_pressure = (1013 - data['pressure']) * 0.01
        surge_tide = data['tide_height'] * 0.3
        
        data['surge_height'] = surge_base + surge_pressure + surge_tide + np.random.normal(0, 0.2, num_samples)
        data['surge_height'] = np.maximum(data['surge_height'], 0)
        
        return pd.DataFrame(data)
    
    def _generate_erosion_data(self, num_samples):
        """Generate synthetic coastal erosion data"""
        data = {}
        
        data['wave_energy'] = np.random.exponential(5, num_samples)
        data['sediment_type'] = np.random.choice(['sand', 'clay', 'rock', 'mixed'], num_samples)
        data['vegetation_cover'] = np.random.beta(2, 2, num_samples) * 100
        data['slope_angle'] = np.random.gamma(2, 5, num_samples)
        data['storm_frequency'] = np.random.poisson(3, num_samples)
        
        # Calculate erosion risk
        risk_score = (
            data['wave_energy'] / 10 +
            (100 - data['vegetation_cover']) / 100 +
            data['slope_angle'] / 30 +
            data['storm_frequency'] / 5
        )
        
        erosion_risk = []
        for score in risk_score:
            if score < 1.0:
                erosion_risk.append('low')
            elif score < 2.0:
                erosion_risk.append('medium')
            elif score < 3.0:
                erosion_risk.append('high')
            else:
                erosion_risk.append('critical')
        
        data['erosion_risk_level'] = erosion_risk
        
        return pd.DataFrame(data)
    
    def _generate_blue_carbon_data(self, num_samples):
        """Generate synthetic blue carbon ecosystem threat data"""
        data = {}
        
        data['water_quality'] = np.random.beta(3, 2, num_samples) * 100
        data['pollution_levels'] = np.random.exponential(2, num_samples)
        data['human_activity'] = np.random.gamma(2, 3, num_samples)
        data['climate_factors'] = np.random.normal(0, 1, num_samples)
        data['biodiversity_index'] = np.random.beta(2, 1, num_samples) * 100
        
        # Threat categories
        threat_scores = (
            (100 - data['water_quality']) / 100 +
            data['pollution_levels'] / 5 +
            data['human_activity'] / 10 +
            np.abs(data['climate_factors']) +
            (100 - data['biodiversity_index']) / 100
        )
        
        threat_categories = []
        for score in threat_scores:
            if score < 1.5:
                threat_categories.append('minimal')
            elif score < 2.5:
                threat_categories.append('moderate')
            elif score < 3.5:
                threat_categories.append('significant')
            else:
                threat_categories.append('severe')
        
        data['threat_category'] = threat_categories
        
        return pd.DataFrame(data)
    
    def preprocess_data(self, data, threat_type):
        """Preprocess data for training"""
        config = self.model_configs[threat_type]
        
        # Handle categorical variables
        categorical_cols = data.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if col not in self.encoders:
                self.encoders[col] = LabelEncoder()
                data[col] = self.encoders[col].fit_transform(data[col])
            else:
                data[col] = self.encoders[col].transform(data[col])
        
        # Separate features and target
        X = data[config['features']]
        y = data[config['target']]
        
        # Scale features
        scaler_name = f"{threat_type}_scaler"
        if scaler_name not in self.scalers:
            self.scalers[scaler_name] = StandardScaler()
            X_scaled = self.scalers[scaler_name].fit_transform(X)
        else:
            X_scaled = self.scalers[scaler_name].transform(X)
        
        return X_scaled, y
    
    def train_storm_surge_model(self, data):
        """Train Random Forest model for storm surge prediction"""
        X, y = self.preprocess_data(data, 'storm_surge')
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        y_pred = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        print(f"Storm Surge Model Performance:")
        print(f"Train R²: {train_score:.4f}")
        print(f"Test R²: {test_score:.4f}")
        print(f"RMSE: {rmse:.4f} meters")
        
        self.models['storm_surge'] = model
        return model
    
    def train_erosion_model(self, data):
        """Train XGBoost model for coastal erosion classification"""
        X, y = self.preprocess_data(data, 'coastal_erosion')
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Coastal Erosion Model Performance:")
        print(f"Accuracy: {accuracy:.4f}")
        
        self.models['coastal_erosion'] = model
        return model
    
    def train_blue_carbon_model(self, data):
        """Train Gradient Boosting model for blue carbon threat assessment"""
        X, y = self.preprocess_data(data, 'blue_carbon_threat')
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Blue Carbon Threat Model Performance:")
        print(f"Accuracy: {accuracy:.4f}")
        
        self.models['blue_carbon_threat'] = model
        return model
    
    def train_all_models(self):
        """Train all BlueGuard AI models"""
        print("Training BlueGuard AI Models (Simplified Version)...")
        print("=" * 50)
        
        # Generate training data
        print("Generating synthetic training data...")
        storm_data = self.generate_synthetic_data('storm_surge')
        erosion_data = self.generate_synthetic_data('coastal_erosion')
        blue_carbon_data = self.generate_synthetic_data('blue_carbon_threat')
        
        # Train models
        print("\n1. Training Storm Surge Prediction Model...")
        self.train_storm_surge_model(storm_data)
        
        print("\n2. Training Coastal Erosion Model...")
        self.train_erosion_model(erosion_data)
        
        print("\n3. Training Blue Carbon Threat Model...")
        self.train_blue_carbon_model(blue_carbon_data)
        
        print("\nAll models trained successfully!")
    
    def save_models(self):
        """Save all trained models and preprocessors"""
        print("Saving models and preprocessors...")
        
        # Save models
        for name, model in self.models.items():
            joblib.dump(model, f'{self.models_path}/{name}_model.joblib')
        
        # Save preprocessors
        joblib.dump(self.scalers, f'{self.models_path}/scalers.joblib')
        joblib.dump(self.encoders, f'{self.models_path}/encoders.joblib')
        
        # Save model configurations
        with open(f'{self.models_path}/model_configs.json', 'w') as f:
            json.dump(self.model_configs, f, indent=2)
        
        print("Models saved successfully!")
    
    def load_models(self):
        """Load all trained models and preprocessors"""
        print("Loading models and preprocessors...")
        
        try:
            # Load models
            for threat_type in ['storm_surge', 'coastal_erosion', 'blue_carbon_threat']:
                model_path = f'{self.models_path}/{threat_type}_model.joblib'
                if os.path.exists(model_path):
                    self.models[threat_type] = joblib.load(model_path)
            
            # Load preprocessors
            if os.path.exists(f'{self.models_path}/scalers.joblib'):
                self.scalers = joblib.load(f'{self.models_path}/scalers.joblib')
            
            if os.path.exists(f'{self.models_path}/encoders.joblib'):
                self.encoders = joblib.load(f'{self.models_path}/encoders.joblib')
            
            print("Models loaded successfully!")
            return True
            
        except Exception as e:
            print(f"Error loading models: {e}")
            return False

if __name__ == "__main__":
    # Initialize and train the BlueGuard AI system
    trainer = BlueGuardAITrainerSimplified()
    
    # Train all models
    trainer.train_all_models()
    
    # Save trained models
    trainer.save_models()
    
    print("\nBlueGuard AI training completed!")
    print("Models are ready for integration with the backend service.")
