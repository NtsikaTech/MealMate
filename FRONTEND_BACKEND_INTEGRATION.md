# Frontend-Backend Integration Guide

## 🎉 Successfully Connected!

Your React frontend is now fully connected to the Flask backend API. Here's what has been implemented:

## 🔧 What's Been Updated

### 1. **New API Service** (`services/apiService.ts`)
- Complete API client for all backend endpoints
- Authentication handling with JWT tokens
- Error handling and response parsing
- Organized into modules: `authAPI`, `mealsAPI`, `groceriesAPI`, `aiAPI`

### 2. **Authentication System**
- **AuthContext** (`contexts/AuthContext.tsx`): Manages user authentication state
- **LoginForm** (`components/LoginForm.tsx`): Login/registration form
- JWT token storage in localStorage
- Automatic token refresh and validation

### 3. **Updated Components**
- **App.tsx**: Now uses backend API instead of localStorage
- **AiMealGenerator**: Uses backend AI service instead of direct Gemini API
- **ToastContext**: Centralized notification system
- All CRUD operations now sync with the database

### 4. **Type Updates**
- Updated `types.ts` to match backend API structure
- Added proper typing for API responses
- Support for both string and number IDs

## 🚀 How to Use

### 1. **Start Both Services**

**Backend (Terminal 1):**
```bash
cd backend
venv\Scripts\activate
python run.py
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

### 2. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### 3. **Login with Test Account**
- Email: `test@mealmate.com`
- Password: `password123`

## 🔗 API Endpoints Used

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Meals
- `GET /api/plan` - Get weekly meal plan
- `POST /api/meals` - Add new meal
- `PUT /api/meals/{id}` - Update meal
- `DELETE /api/meals/{id}` - Delete meal

### Groceries
- `GET /api/groceries` - Get grocery list
- `POST /api/groceries` - Add grocery item
- `PUT /api/groceries/{id}` - Update grocery item
- `DELETE /api/groceries/{id}` - Delete grocery item

### AI Service
- `POST /api/generate-ideas` - Generate meal ideas
- `GET /api/health` - AI service health check

## 🔒 Security Features

1. **JWT Authentication**: All API calls include Bearer tokens
2. **Token Storage**: Secure localStorage management
3. **Auto-logout**: Expired tokens trigger automatic logout
4. **Error Handling**: Comprehensive error messages for users

## 🎯 Key Features Working

✅ **User Authentication**: Register, login, logout  
✅ **Meal Planning**: Create, read, update, delete meals  
✅ **Grocery Lists**: Manage shopping items  
✅ **AI Integration**: Generate meal ideas via backend  
✅ **Real-time Sync**: All changes persist to database  
✅ **Error Handling**: User-friendly error messages  
✅ **Loading States**: Proper loading indicators  

## 🧪 Testing the Integration

1. **Register a new account** or use the test account
2. **Add meals** to your weekly plan
3. **Generate AI meal ideas** (requires Gemini API key in backend)
4. **Manage grocery list** - items sync with meals
5. **Test all CRUD operations** - everything persists to database

## 🔧 Configuration

### Environment Variables
The frontend automatically connects to `http://localhost:5000`. To change this:

1. Update `API_BASE_URL` in `services/apiService.ts`
2. Update CORS settings in backend `config.py`

### AI Service
To enable AI meal generation:
1. Add your Gemini API key to backend `.env` file
2. Restart the backend server

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running on port 5000
2. **Authentication Errors**: Check if JWT token is valid
3. **AI Not Working**: Verify Gemini API key is set in backend
4. **Database Errors**: Check if SQLite database is initialized

### Debug Steps

1. Check browser console for errors
2. Verify backend is running: http://localhost:5000/health
3. Check network tab for failed API calls
4. Verify authentication token in localStorage

## 🎉 What's Next?

Your MealMate app is now a full-stack application with:
- ✅ Secure user authentication
- ✅ Persistent data storage
- ✅ AI-powered meal suggestions
- ✅ Real-time synchronization
- ✅ Professional error handling

You can now deploy this to production or continue adding features! 