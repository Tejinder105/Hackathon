#!/bin/bash

# BlueGuard AI Service Setup Script
echo "Setting up BlueGuard AI Service..."

# Create virtual environment
python -m venv ml_service/venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source ml_service/venv/Scripts/activate
else
    source ml_service/venv/bin/activate
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r ml_service/requirements.txt

# Train initial models
echo "Training initial AI models..."
cd ml_service
python train_models.py

# Start AI service in background
echo "Starting AI service..."
python ai_service.py &

echo "BlueGuard AI Service setup complete!"
echo "AI Service running on http://localhost:5001"
echo "Backend can now use AI predictions"
