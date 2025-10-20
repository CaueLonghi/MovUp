#!/bin/bash

# MovUp Backend Startup Script
echo "Starting MovUp Video Analysis API..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Navigate to AI directory
cd "$(dirname "$0")/AI"

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the FastAPI server
echo "Starting FastAPI server on http://127.0.0.1:8000"
echo "API Documentation available at: http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to stop the server"
python root.py
