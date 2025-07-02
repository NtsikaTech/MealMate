from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import config
from models import db
from auth import auth_bp
from meals import meals_bp
from groceries import groceries_bp
from ai_service import ai_bp

def create_app(config_name='default'):
    """
    Application factory pattern for creating Flask app
    """
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)
    
    # Configure CORS
    CORS(app, origins=app.config.get('CORS_ORIGINS', ['http://localhost:5173']))
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(meals_bp)
    app.register_blueprint(groceries_bp)
    app.register_blueprint(ai_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({'error': 'Method not allowed'}), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        """
        Health check endpoint
        
        Response:
        {
            "status": "healthy",
            "message": "MealMate API is running"
        }
        """
        return jsonify({
            'status': 'healthy',
            'message': 'MealMate API is running'
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        """
        Root endpoint with API information
        
        Response:
        {
            "name": "MealMate API",
            "version": "1.0.0",
            "description": "AI-powered meal planning API",
            "endpoints": {
                "auth": "/api/auth/*",
                "meals": "/api/meals/*",
                "groceries": "/api/groceries/*",
                "ai": "/api/generate-ideas"
            }
        }
        """
        return jsonify({
            'name': 'MealMate API',
            'version': '1.0.0',
            'description': 'AI-powered meal planning API',
            'endpoints': {
                'auth': {
                    'register': 'POST /api/auth/register',
                    'login': 'POST /api/auth/login',
                    'profile': 'GET /api/auth/profile'
                },
                'meals': {
                    'get_plan': 'GET /api/plan',
                    'add_meal': 'POST /api/meals',
                    'update_meal': 'PUT /api/meals/{id}',
                    'delete_meal': 'DELETE /api/meals/{id}'
                },
                'groceries': {
                    'get_list': 'GET /api/groceries',
                    'add_item': 'POST /api/groceries',
                    'update_item': 'PUT /api/groceries/{id}',
                    'delete_item': 'DELETE /api/groceries/{id}',
                    'clear_purchased': 'DELETE /api/groceries/clear-purchased'
                },
                'ai': {
                    'generate_ideas': 'POST /api/generate-ideas',
                    'health_check': 'GET /api/health'
                }
            }
        }), 200
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.config.get('DEBUG', False)
    ) 