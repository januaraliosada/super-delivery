from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from src.models.user import User, db
from src.routes.error_handler import APIError, log_info, log_error
from datetime import datetime, timedelta
import jwt
import os

auth_bp = Blueprint('auth', __name__)

# JWT configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-delivery-secret-key-change-in-production')
JWT_EXPIRATION_HOURS = 24

def generate_jwt_token(user_id, user_type):
    """Generate JWT token for user authentication"""
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

def verify_jwt_token(token):
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.json
        if not data:
            raise APIError("No data provided", 400)
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'user_type']
        for field in required_fields:
            if field not in data or not data[field]:
                raise APIError(f"Missing required field: {field}", 400)
        
        # Validate user type
        valid_user_types = ['customer', 'restaurant_owner', 'driver', 'admin']
        if data['user_type'] not in valid_user_types:
            raise APIError(f"Invalid user type. Must be one of: {', '.join(valid_user_types)}", 400)
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            raise APIError("User with this email already exists", 409)
        
        # Validate password strength
        password = data['password']
        if len(password) < 6:
            raise APIError("Password must be at least 6 characters long", 400)
        
        # Create new user
        from src.models.user import UserType
        user = User(
            email=data['email'],
            password_hash=generate_password_hash(password),
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone', ''),
            address=data.get('address', ''),
            user_type=UserType(data['user_type'])
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = generate_jwt_token(user.id, user.user_type.value)
        
        log_info(f"New user registered: {user.email}")
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type.value
            },
            'token': token
        }), 201
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error registering user: {str(e)}", exc_info=True)
        raise APIError("Failed to register user", 500)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    try:
        data = request.json
        if not data:
            raise APIError("No data provided", 400)
        
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            raise APIError("Email and password are required", 400)
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        if not user:
            raise APIError("Invalid email or password", 401)
        
        # Check password
        if not check_password_hash(user.password_hash, password):
            raise APIError("Invalid email or password", 401)
        
        # Update last login
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Generate JWT token
        token = generate_jwt_token(user.id, user.user_type.value)
        
        log_info(f"User logged in: {user.email}")
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
                'user_type': user.user_type.value
            },
            'token': token
        })
        
    except APIError:
        raise
    except Exception as e:
        log_error(f"Error during login: {str(e)}", exc_info=True)
        raise APIError("Login failed", 500)

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    """Logout user (client-side token removal)"""
    try:
        # In JWT-based authentication, logout is primarily handled on the client side
        # by removing the token. We can log the logout event here.
        
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token[7:]  # Remove 'Bearer ' prefix
            payload = verify_jwt_token(token)
            if payload:
                log_info(f"User logged out: user_id={payload['user_id']}")
        
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        })
        
    except Exception as e:
        log_error(f"Error during logout: {str(e)}", exc_info=True)
        return jsonify({
            'success': True,
            'message': 'Logout completed'
        })

@auth_bp.route('/auth/verify', methods=['GET'])
def verify_token():
    """Verify JWT token and return user information"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            raise APIError("No token provided", 401)
        
        if token.startswith('Bearer '):
            token = token[7:]  # Remove 'Bearer ' prefix
        
        payload = verify_jwt_token(token)
        if not payload:
            raise APIError("Invalid or expired token", 401)
        
        # Get user from database
        user = User.query.get(payload['user_id'])
        if not user:
            raise APIError("User not found", 404)
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
                'user_type': user.user_type.value
            },
            'token_valid': True
        })
        
    except APIError:
        raise
    except Exception as e:
        log_error(f"Error verifying token: {str(e)}", exc_info=True)
        raise APIError("Token verification failed", 500)

@auth_bp.route('/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh JWT token"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            raise APIError("No token provided", 401)
        
        if token.startswith('Bearer '):
            token = token[7:]  # Remove 'Bearer ' prefix
        
        payload = verify_jwt_token(token)
        if not payload:
            raise APIError("Invalid or expired token", 401)
        
        # Generate new token
        new_token = generate_jwt_token(payload['user_id'], payload['user_type'])
        
        log_info(f"Token refreshed for user_id: {payload['user_id']}")
        return jsonify({
            'success': True,
            'message': 'Token refreshed successfully',
            'token': new_token
        })
        
    except APIError:
        raise
    except Exception as e:
        log_error(f"Error refreshing token: {str(e)}", exc_info=True)
        raise APIError("Token refresh failed", 500)

@auth_bp.route('/auth/change-password', methods=['PUT'])
def change_password():
    """Change user password"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            raise APIError("No token provided", 401)
        
        if token.startswith('Bearer '):
            token = token[7:]  # Remove 'Bearer ' prefix
        
        payload = verify_jwt_token(token)
        if not payload:
            raise APIError("Invalid or expired token", 401)
        
        data = request.json
        if not data:
            raise APIError("No data provided", 400)
        
        # Validate required fields
        required_fields = ['current_password', 'new_password']
        for field in required_fields:
            if field not in data or not data[field]:
                raise APIError(f"Missing required field: {field}", 400)
        
        # Get user
        user = User.query.get(payload['user_id'])
        if not user:
            raise APIError("User not found", 404)
        
        # Verify current password
        if not check_password_hash(user.password_hash, data['current_password']):
            raise APIError("Current password is incorrect", 401)
        
        # Validate new password
        new_password = data['new_password']
        if len(new_password) < 6:
            raise APIError("New password must be at least 6 characters long", 400)
        
        # Update password
        user.password_hash = generate_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        log_info(f"Password changed for user: {user.email}")
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error changing password: {str(e)}", exc_info=True)
        raise APIError("Failed to change password", 500)

@auth_bp.route('/auth/profile', methods=['GET'])
def get_profile():
    """Get user profile information"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            raise APIError("No token provided", 401)
        
        if token.startswith('Bearer '):
            token = token[7:]  # Remove 'Bearer ' prefix
        
        payload = verify_jwt_token(token)
        if not payload:
            raise APIError("Invalid or expired token", 401)
        
        # Get user from database
        user = User.query.get(payload['user_id'])
        if not user:
            raise APIError("User not found", 404)
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
                'user_type': user.user_type.value,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat()
            }
        })
        
    except APIError:
        raise
    except Exception as e:
        log_error(f"Error fetching profile: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch profile", 500)

@auth_bp.route('/auth/profile', methods=['PUT'])
def update_profile():
    """Update user profile information"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            raise APIError("No token provided", 401)
        
        if token.startswith('Bearer '):
            token = token[7:]  # Remove 'Bearer ' prefix
        
        payload = verify_jwt_token(token)
        if not payload:
            raise APIError("Invalid or expired token", 401)
        
        data = request.json
        if not data:
            raise APIError("No data provided", 400)
        
        # Get user
        user = User.query.get(payload['user_id'])
        if not user:
            raise APIError("User not found", 404)
        
        # Update allowed fields
        updatable_fields = ['first_name', 'last_name', 'phone', 'address']
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        log_info(f"Profile updated for user: {user.email}")
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'address': user.address,
                'user_type': user.user_type.value
            }
        })
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error updating profile: {str(e)}", exc_info=True)
        raise APIError("Failed to update profile", 500)

