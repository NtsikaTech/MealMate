#!/usr/bin/env python3
"""
Database initialization script for MealMate
"""
import os
from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

def init_database():
    """Initialize the database with tables and sample data"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully!")
        
        # Check if test user exists
        test_user = User.query.filter_by(email='test@mealmate.com').first()
        
        if not test_user:
            print("Creating test user...")
            test_user = User(
                email='test@mealmate.com',
                password_hash=generate_password_hash('password123')
            )
            db.session.add(test_user)
            db.session.commit()
            print("✅ Test user created successfully!")
            print("   Email: test@mealmate.com")
            print("   Password: password123")
        else:
            print("✅ Test user already exists")
        
        print("\n🎉 Database initialization complete!")
        print("You can now run the application with: python run.py")

if __name__ == '__main__':
    init_database() 