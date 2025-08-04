from flask import Blueprint, jsonify, current_app
import logging
import traceback

error_bp = Blueprint('error', __name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom exception for API errors"""
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        result = {'error': True, 'message': self.message}
        if self.payload:
            result.update(self.payload)
        return result

@error_bp.app_errorhandler(APIError)
def handle_api_error(error):
    """Handle custom API errors"""
    logger.error(f"API Error: {error.message}")
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@error_bp.app_errorhandler(400)
def handle_bad_request(error):
    """Handle bad request errors"""
    logger.error(f"Bad Request: {error}")
    return jsonify({
        'error': True,
        'message': 'Bad request. Please check your input and try again.',
        'status_code': 400
    }), 400

@error_bp.app_errorhandler(404)
def handle_not_found(error):
    """Handle not found errors"""
    logger.error(f"Not Found: {error}")
    return jsonify({
        'error': True,
        'message': 'The requested resource was not found.',
        'status_code': 404
    }), 404

@error_bp.app_errorhandler(405)
def handle_method_not_allowed(error):
    """Handle method not allowed errors"""
    logger.error(f"Method Not Allowed: {error}")
    return jsonify({
        'error': True,
        'message': 'The requested method is not allowed for this endpoint.',
        'status_code': 405
    }), 405

@error_bp.app_errorhandler(500)
def handle_internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal Server Error: {error}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # Don't expose internal error details in production
    if current_app.config.get('DEBUG'):
        message = str(error)
    else:
        message = 'An internal server error occurred. Please try again later.'
    
    return jsonify({
        'error': True,
        'message': message,
        'status_code': 500
    }), 500

@error_bp.app_errorhandler(Exception)
def handle_unexpected_error(error):
    """Handle unexpected errors"""
    logger.error(f"Unexpected Error: {error}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return jsonify({
        'error': True,
        'message': 'An unexpected error occurred. Please try again later.',
        'status_code': 500
    }), 500

def log_info(message):
    """Log info message"""
    logger.info(message)

def log_error(message, exc_info=None):
    """Log error message"""
    logger.error(message, exc_info=exc_info)

def log_warning(message):
    """Log warning message"""
    logger.warning(message)

