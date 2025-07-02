from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import google.generativeai as genai
import json
import os
from config import Config

# Create AI service blueprint
ai_bp = Blueprint('ai', __name__, url_prefix='/api')

# Configure Gemini AI
if Config.GEMINI_API_KEY:
    genai.configure(api_key=Config.GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables")

@ai_bp.route('/generate-ideas', methods=['POST'])
@jwt_required()
def generate_meal_ideas():
    """
    Generate meal ideas using Gemini AI
    
    Headers:
    Authorization: Bearer <jwt_token>
    
    Request Body:
    {
        "prompt": "I want vegetarian meals for dinner this week",
        "count": 3
    }
    
    Response:
    {
        "meals": [
            {
                "name": "Vegetarian Stir Fry",
                "notes": "A delicious and healthy stir fry with tofu and vegetables",
                "ingredients": [
                    {
                        "name": "Tofu",
                        "quantity": "200g"
                    },
                    {
                        "name": "Broccoli",
                        "quantity": "1 head"
                    }
                ]
            }
        ]
    }
    """
    try:
        # Check if API key is configured
        if not Config.GEMINI_API_KEY:
            return jsonify({
                'error': 'AI service is not configured. Please contact administrator.'
            }), 503
        
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('prompt'):
            return jsonify({'error': 'Prompt is required'}), 400
        
        prompt = data['prompt']
        count = data.get('count', 3)  # Default to 3 meals
        
        # Validate count
        if not isinstance(count, int) or count < 1 or count > 10:
            return jsonify({'error': 'Count must be between 1 and 10'}), 400
        
        # Create system instruction for consistent JSON output
        system_instruction = f"""You are a creative chef who generates meal ideas. The user will provide their preferences.
        
        You must return a valid JSON array of exactly {count} meal objects. Each object must have these exact keys:
        1. "name" (string): The name of the meal
        2. "notes" (string): A brief, enticing description of the meal
        3. "ingredients" (array): Each object in this array must have "name" (string) and "quantity" (string)
        
        Example format:
        [
            {{
                "name": "Meal Name",
                "notes": "Description of the meal",
                "ingredients": [
                    {{"name": "Ingredient 1", "quantity": "100g"}},
                    {{"name": "Ingredient 2", "quantity": "2 pieces"}}
                ]
            }}
        ]
        
        Do not include any other text, explanations, or markdown formatting outside of the JSON array.
        Ensure the response is valid JSON that can be parsed directly."""
        
        # Generate content using Gemini
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        response = model.generate_content(
            f"Generate {count} meal ideas based on this request: \"{prompt}\"",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.8,
                top_k=40,
                max_output_tokens=2048,
            ),
            system_instruction=system_instruction
        )
        
        # Extract and clean the response text
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON response
        try:
            parsed_data = json.loads(response_text)
        except json.JSONDecodeError as e:
            return jsonify({
                'error': 'Failed to parse AI response',
                'details': f'Invalid JSON: {str(e)}',
                'raw_response': response_text
            }), 500
        
        # Validate response structure
        if not isinstance(parsed_data, list):
            return jsonify({
                'error': 'Invalid AI response format',
                'details': 'Expected array of meals'
            }), 500
        
        # Validate each meal object
        validated_meals = []
        for i, meal in enumerate(parsed_data):
            if not isinstance(meal, dict):
                continue
            
            # Check required fields
            if not all(key in meal for key in ['name', 'notes', 'ingredients']):
                continue
            
            # Validate ingredients
            if not isinstance(meal['ingredients'], list):
                continue
            
            valid_ingredients = []
            for ingredient in meal['ingredients']:
                if isinstance(ingredient, dict) and 'name' in ingredient and 'quantity' in ingredient:
                    valid_ingredients.append({
                        'name': str(ingredient['name']),
                        'quantity': str(ingredient['quantity'])
                    })
            
            validated_meals.append({
                'name': str(meal['name']),
                'notes': str(meal['notes']),
                'ingredients': valid_ingredients
            })
        
        if not validated_meals:
            return jsonify({
                'error': 'No valid meals generated',
                'details': 'AI response did not contain valid meal data'
            }), 500
        
        return jsonify({
            'meals': validated_meals
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to generate meal ideas',
            'details': str(e)
        }), 500

@ai_bp.route('/health', methods=['GET'])
def ai_health_check():
    """
    Check if AI service is properly configured
    
    Response:
    {
        "status": "healthy",
        "configured": true
    }
    """
    try:
        is_configured = bool(Config.GEMINI_API_KEY)
        
        return jsonify({
            'status': 'healthy',
            'configured': is_configured
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'configured': False,
            'error': str(e)
        }), 500 