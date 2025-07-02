from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Meal, Ingredient, User
from datetime import datetime

# Create meals blueprint
meals_bp = Blueprint('meals', __name__, url_prefix='/api')

@meals_bp.route('/plan', methods=['GET'])
@jwt_required()
def get_weekly_plan():
    """
    Get user's weekly meal plan
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "meals": [
            {
                "id": 1,
                "user_id": 1,
                "day_of_week": "Monday",
                "name": "Spaghetti Carbonara",
                "notes": "Classic Italian pasta dish",
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00",
                "ingredients": [
                    {
                        "id": 1,
                        "meal_id": 1,
                        "name": "Spaghetti",
                        "quantity": "200g"
                    }
                ]
            }
        ]
    }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Get all meals for the current user
        meals = Meal.query.filter_by(user_id=current_user_id).all()
        
        # Convert to dictionary format
        meals_data = [meal.to_dict() for meal in meals]
        
        return jsonify({'meals': meals_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch meal plan', 'details': str(e)}), 500

@meals_bp.route('/meals', methods=['POST'])
@jwt_required()
def add_meal():
    """
    Add a new meal to the plan
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Request Body:
    {
        "day_of_week": "Monday",
        "name": "Spaghetti Carbonara",
        "notes": "Classic Italian pasta dish",
        "ingredients": [
            {
                "name": "Spaghetti",
                "quantity": "200g"
            },
            {
                "name": "Eggs",
                "quantity": "2"
            }
        ]
    }
    
    Response:
    {
        "message": "Meal added successfully",
        "meal": {
            "id": 1,
            "user_id": 1,
            "day_of_week": "Monday",
            "name": "Spaghetti Carbonara",
            "notes": "Classic Italian pasta dish",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
            "ingredients": [...]
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('day_of_week') or not data.get('name'):
            return jsonify({'error': 'Day of week and meal name are required'}), 400
        
        # Validate day of week
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if data['day_of_week'] not in valid_days:
            return jsonify({'error': 'Invalid day of week'}), 400
        
        # Check if meal already exists for this day and user
        existing_meal = Meal.query.filter_by(
            user_id=current_user_id,
            day_of_week=data['day_of_week']
        ).first()
        
        if existing_meal:
            return jsonify({'error': 'Meal already exists for this day'}), 409
        
        # Create new meal
        new_meal = Meal(
            user_id=current_user_id,
            day_of_week=data['day_of_week'],
            name=data['name'],
            notes=data.get('notes', '')
        )
        
        db.session.add(new_meal)
        db.session.flush()  # Get the meal ID
        
        # Add ingredients if provided
        ingredients_data = data.get('ingredients', [])
        for ingredient_data in ingredients_data:
            if ingredient_data.get('name') and ingredient_data.get('quantity'):
                ingredient = Ingredient(
                    meal_id=new_meal.id,
                    name=ingredient_data['name'],
                    quantity=ingredient_data['quantity']
                )
                db.session.add(ingredient)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Meal added successfully',
            'meal': new_meal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add meal', 'details': str(e)}), 500

@meals_bp.route('/meals/<int:meal_id>', methods=['PUT'])
@jwt_required()
def update_meal(meal_id):
    """
    Update an existing meal
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Request Body:
    {
        "day_of_week": "Tuesday",
        "name": "Updated Meal Name",
        "notes": "Updated notes",
        "ingredients": [
            {
                "name": "New Ingredient",
                "quantity": "100g"
            }
        ]
    }
    
    Response:
    {
        "message": "Meal updated successfully",
        "meal": {...}
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Find the meal and verify ownership
        meal = Meal.query.filter_by(id=meal_id, user_id=current_user_id).first()
        if not meal:
            return jsonify({'error': 'Meal not found'}), 404
        
        # Update meal fields
        if data.get('day_of_week'):
            valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            if data['day_of_week'] not in valid_days:
                return jsonify({'error': 'Invalid day of week'}), 400
            meal.day_of_week = data['day_of_week']
        
        if data.get('name'):
            meal.name = data['name']
        
        if 'notes' in data:
            meal.notes = data['notes']
        
        # Update ingredients if provided
        if 'ingredients' in data:
            # Remove existing ingredients
            Ingredient.query.filter_by(meal_id=meal.id).delete()
            
            # Add new ingredients
            for ingredient_data in data['ingredients']:
                if ingredient_data.get('name') and ingredient_data.get('quantity'):
                    ingredient = Ingredient(
                        meal_id=meal.id,
                        name=ingredient_data['name'],
                        quantity=ingredient_data['quantity']
                    )
                    db.session.add(ingredient)
        
        meal.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Meal updated successfully',
            'meal': meal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update meal', 'details': str(e)}), 500

@meals_bp.route('/meals/<int:meal_id>', methods=['DELETE'])
@jwt_required()
def delete_meal(meal_id):
    """
    Delete a meal from the plan
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "message": "Meal deleted successfully"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Find the meal and verify ownership
        meal = Meal.query.filter_by(id=meal_id, user_id=current_user_id).first()
        if not meal:
            return jsonify({'error': 'Meal not found'}), 404
        
        # Delete the meal (ingredients will be deleted due to cascade)
        db.session.delete(meal)
        db.session.commit()
        
        return jsonify({'message': 'Meal deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete meal', 'details': str(e)}), 500 