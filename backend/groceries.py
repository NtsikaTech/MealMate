from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, GroceryItem
from datetime import datetime

# Create groceries blueprint
groceries_bp = Blueprint('groceries', __name__, url_prefix='/api')

@groceries_bp.route('/groceries', methods=['GET'])
@jwt_required()
def get_grocery_list():
    """
    Get user's grocery list
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "grocery_items": [
            {
                "id": 1,
                "user_id": 1,
                "name": "Milk",
                "quantity": "1L",
                "purchased": false,
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        ]
    }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Get all grocery items for the current user
        grocery_items = GroceryItem.query.filter_by(user_id=current_user_id).order_by(GroceryItem.created_at.desc()).all()
        
        # Convert to dictionary format
        items_data = [item.to_dict() for item in grocery_items]
        
        return jsonify({'grocery_items': items_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch grocery list', 'details': str(e)}), 500

@groceries_bp.route('/groceries', methods=['POST'])
@jwt_required()
def add_grocery_item():
    """
    Add a new item to the grocery list
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Request Body:
    {
        "name": "Milk",
        "quantity": "1L"
    }
    
    Response:
    {
        "message": "Grocery item added successfully",
        "item": {
            "id": 1,
            "user_id": 1,
            "name": "Milk",
            "quantity": "1L",
            "purchased": false,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('name') or not data.get('quantity'):
            return jsonify({'error': 'Item name and quantity are required'}), 400
        
        # Create new grocery item
        new_item = GroceryItem(
            user_id=current_user_id,
            name=data['name'].strip(),
            quantity=data['quantity'].strip(),
            purchased=False
        )
        
        db.session.add(new_item)
        db.session.commit()
        
        return jsonify({
            'message': 'Grocery item added successfully',
            'item': new_item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add grocery item', 'details': str(e)}), 500

@groceries_bp.route('/groceries/<int:item_id>', methods=['PUT'])
@jwt_required()
def toggle_grocery_item(item_id):
    """
    Toggle the purchased status of a grocery item
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Request Body (optional):
    {
        "purchased": true,
        "name": "Updated Milk",
        "quantity": "2L"
    }
    
    Response:
    {
        "message": "Grocery item updated successfully",
        "item": {
            "id": 1,
            "user_id": 1,
            "name": "Updated Milk",
            "quantity": "2L",
            "purchased": true,
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    }
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        # Find the item and verify ownership
        item = GroceryItem.query.filter_by(id=item_id, user_id=current_user_id).first()
        if not item:
            return jsonify({'error': 'Grocery item not found'}), 404
        
        # Update item fields
        if 'purchased' in data:
            item.purchased = bool(data['purchased'])
        
        if data.get('name'):
            item.name = data['name'].strip()
        
        if data.get('quantity'):
            item.quantity = data['quantity'].strip()
        
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Grocery item updated successfully',
            'item': item.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update grocery item', 'details': str(e)}), 500

@groceries_bp.route('/groceries/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_grocery_item(item_id):
    """
    Delete a grocery item from the list
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "message": "Grocery item deleted successfully"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Find the item and verify ownership
        item = GroceryItem.query.filter_by(id=item_id, user_id=current_user_id).first()
        if not item:
            return jsonify({'error': 'Grocery item not found'}), 404
        
        # Delete the item
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Grocery item deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete grocery item', 'details': str(e)}), 500

@groceries_bp.route('/groceries/clear-purchased', methods=['DELETE'])
@jwt_required()
def clear_purchased_items():
    """
    Clear all purchased items from the grocery list
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Response:
    {
        "message": "Purchased items cleared successfully",
        "deleted_count": 5
    }
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Delete all purchased items for the current user
        deleted_count = GroceryItem.query.filter_by(
            user_id=current_user_id,
            purchased=True
        ).delete()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Purchased items cleared successfully',
            'deleted_count': deleted_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to clear purchased items', 'details': str(e)}), 500 