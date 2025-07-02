#!/usr/bin/env python3
"""
Run script for MealMate Flask API
"""
import os
from app import create_app

# Set environment
env = os.environ.get('FLASK_ENV', 'development')

# Create and run the application
app = create_app(env)

if __name__ == '__main__':
    print(f"Starting MealMate API in {env} mode...")
    print("API will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("API docs: http://localhost:5000/")
    print("\nPress Ctrl+C to stop the server")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=(env == 'development')
    ) 