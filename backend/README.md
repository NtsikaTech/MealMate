# MealMate Backend API

A Flask-based REST API for the MealMate meal planning application with JWT authentication, PostgreSQL database, and Gemini AI integration.

## 🚀 Features

- **JWT Authentication**: Secure user registration and login
- **PostgreSQL Database**: Robust data storage with SQLAlchemy ORM
- **Meal Planning**: CRUD operations for weekly meal plans
- **Grocery Lists**: Manage shopping lists with purchase tracking
- **AI Integration**: Gemini AI-powered meal suggestions
- **CORS Support**: Cross-origin requests for frontend integration
- **Environment Configuration**: Flexible configuration management

## 🛠️ Tech Stack

- **Framework**: Flask 3.0.0
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Service**: Google Gemini AI
- **Security**: Password hashing with bcrypt
- **CORS**: Cross-origin resource sharing

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL database
- Google Gemini API key

## 🔧 Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

5. **Configure your .env file**
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/mealmate_db
   
   # JWT Configuration
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
   
   # Gemini AI Configuration
   GEMINI_API_KEY=your-gemini-api-key-here
   
   # Flask Configuration
   FLASK_ENV=development
   FLASK_DEBUG=True
   SECRET_KEY=your-flask-secret-key-change-this-in-production
   ```

6. **Initialize the database**
   ```bash
   # Initialize migrations
   flask db init
   
   # Create initial migration
   flask db migrate -m "Initial migration"
   
   # Apply migrations
   flask db upgrade
   ```

## 🚀 Running the Application

### Development Mode
```bash
python run.py
```

### Production Mode
```bash
export FLASK_ENV=production
python run.py
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Meal Planning Endpoints

#### Get Weekly Plan
```http
GET /api/plan
Authorization: Bearer <jwt_token>
```

#### Add Meal
```http
POST /api/meals
Authorization: Bearer <jwt_token>
Content-Type: application/json

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
```

#### Update Meal
```http
PUT /api/meals/{meal_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "name": "Updated Meal Name",
    "notes": "Updated notes"
}
```

#### Delete Meal
```http
DELETE /api/meals/{meal_id}
Authorization: Bearer <jwt_token>
```

### Grocery List Endpoints

#### Get Grocery List
```http
GET /api/groceries
Authorization: Bearer <jwt_token>
```

#### Add Grocery Item
```http
POST /api/groceries
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "name": "Milk",
    "quantity": "1L"
}
```

#### Toggle Item Purchased
```http
PUT /api/groceries/{item_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "purchased": true
}
```

#### Delete Grocery Item
```http
DELETE /api/groceries/{item_id}
Authorization: Bearer <jwt_token>
```

#### Clear Purchased Items
```http
DELETE /api/groceries/clear-purchased
Authorization: Bearer <jwt_token>
```

### AI Service Endpoints

#### Generate Meal Ideas
```http
POST /api/generate-ideas
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "prompt": "I want vegetarian meals for dinner this week",
    "count": 3
}
```

#### AI Health Check
```http
GET /api/health
```

### Utility Endpoints

#### API Health Check
```http
GET /health
```

#### API Documentation
```http
GET /
```

## 🗄️ Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `password_hash`
- `created_at`

### Meals Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `day_of_week`
- `name`
- `notes`
- `created_at`
- `updated_at`

### Ingredients Table
- `id` (Primary Key)
- `meal_id` (Foreign Key)
- `name`
- `quantity`

### Grocery Items Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `name`
- `quantity`
- `purchased`
- `created_at`
- `updated_at`

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection
- **CORS Configuration**: Controlled cross-origin access
- **Environment Variables**: Sensitive data stored in environment variables

## 🧪 Testing

### Manual Testing with curl

1. **Register a user**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
   ```

2. **Login and get token**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
   ```

3. **Use token for authenticated requests**
   ```bash
   curl -X GET http://localhost:5000/api/plan \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all production environment variables
2. **Database**: Use production PostgreSQL instance
3. **Security**: Change all default secret keys
4. **CORS**: Configure allowed origins for production domain
5. **SSL**: Use HTTPS in production
6. **Process Manager**: Use Gunicorn or uWSGI for production

### Example Production Setup
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `http://localhost:5000/`
- Review the health check at `http://localhost:5000/health`
- Check the AI service status at `http://localhost:5000/api/health` 