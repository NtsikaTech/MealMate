from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func

db = SQLAlchemy()

class User(db.Model):
    """User model for authentication and user management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=func.now())
    
    # Relationships
    meals = db.relationship('Meal', backref='user', lazy=True, cascade='all, delete-orphan')
    grocery_items = db.relationship('GroceryItem', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'

class Meal(db.Model):
    """Meal model for storing meal plan information"""
    __tablename__ = 'meals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    day_of_week = db.Column(db.String(20), nullable=False)  # Monday, Tuesday, etc.
    name = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    ingredients = db.relationship('Ingredient', backref='meal', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Meal {self.name} for {self.day_of_week}>'
    
    def to_dict(self):
        """Convert meal to dictionary for JSON response"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'day_of_week': self.day_of_week,
            'name': self.name,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'ingredients': [ingredient.to_dict() for ingredient in self.ingredients]
        }

class Ingredient(db.Model):
    """Ingredient model for meal ingredients"""
    __tablename__ = 'ingredients'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.String(100), nullable=False)
    
    def __repr__(self):
        return f'<Ingredient {self.name} ({self.quantity})>'
    
    def to_dict(self):
        """Convert ingredient to dictionary for JSON response"""
        return {
            'id': self.id,
            'meal_id': self.meal_id,
            'name': self.name,
            'quantity': self.quantity
        }

class GroceryItem(db.Model):
    """Grocery item model for shopping list"""
    __tablename__ = 'grocery_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.String(100), nullable=False)
    purchased = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=func.now())
    updated_at = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f'<GroceryItem {self.name} ({self.quantity}) - {"Purchased" if self.purchased else "Not purchased"}>'
    
    def to_dict(self):
        """Convert grocery item to dictionary for JSON response"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'quantity': self.quantity,
            'purchased': self.purchased,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 