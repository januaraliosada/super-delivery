from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.menu_item import MenuItem
from src.models.restaurant import Restaurant
from src.models.cart import Cart, CartItem
from src.routes.error_handler import APIError, log_info, log_error
from src.routes.auth import verify_jwt_token
from datetime import datetime
import json

cart_bp = Blueprint('cart', __name__)

def get_user_from_token():
    """Extract user ID from JWT token"""
    token = request.headers.get('Authorization')
    if not token:
        raise APIError("Authentication required", 401)
    
    if token.startswith('Bearer '):
        token = token[7:]  # Remove 'Bearer ' prefix
    
    payload = verify_jwt_token(token)
    if not payload:
        raise APIError("Invalid or expired token", 401)
    
    return payload['user_id']

@cart_bp.route('/cart', methods=['GET'])
def get_cart():
    """Get user's current cart"""
    try:
        user_id = get_user_from_token()
        
        # Get user's active cart
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart:
            return jsonify({
                'success': True,
                'cart': {
                    'items': [],
                    'total_items': 0,
                    'subtotal': 0.0,
                    'restaurant': None
                }
            })
        
        # Get cart items with menu item details
        cart_items = []
        total_items = 0
        subtotal = 0.0
        
        for cart_item in cart.items:
            menu_item = cart_item.menu_item
            if menu_item:
                item_total = float(cart_item.price) * cart_item.quantity
                cart_items.append({
                    'id': cart_item.id,
                    'menu_item_id': menu_item.id,
                    'name': menu_item.name,
                    'description': menu_item.description,
                    'price': float(cart_item.price),
                    'quantity': cart_item.quantity,
                    'customizations': cart_item.customizations,
                    'item_total': item_total,
                    'image_url': menu_item.image_url
                })
                total_items += cart_item.quantity
                subtotal += item_total
        
        # Get restaurant details
        restaurant = cart.restaurant
        restaurant_info = None
        if restaurant:
            restaurant_info = {
                'id': restaurant.id,
                'name': restaurant.name,
                'address': restaurant.address,
                'phone': restaurant.phone,
                'cuisine_type': restaurant.cuisine_type.value if restaurant.cuisine_type else None,
                'delivery_fee': float(restaurant.delivery_fee) if restaurant.delivery_fee else 2.99,
                'minimum_order': float(restaurant.minimum_order) if restaurant.minimum_order else 15.00
            }
        
        return jsonify({
            'success': True,
            'cart': {
                'id': cart.id,
                'items': cart_items,
                'total_items': total_items,
                'subtotal': subtotal,
                'restaurant': restaurant_info,
                'updated_at': cart.updated_at.isoformat()
            }
        })
        
    except APIError:
        raise
    except Exception as e:
        log_error(f"Error fetching cart for user: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch cart", 500)

@cart_bp.route('/cart/add', methods=['POST'])
def add_to_cart():
    """Add item to cart"""
    try:
        user_id = get_user_from_token()
        
        data = request.json
        if not data:
            raise APIError("No data provided", 400)
        
        # Validate required fields
        required_fields = ['menu_item_id', 'quantity']
        for field in required_fields:
            if field not in data:
                raise APIError(f"Missing required field: {field}", 400)
        
        menu_item_id = data['menu_item_id']
        quantity = data['quantity']
        customizations = data.get('customizations', '')
        
        if quantity <= 0:
            raise APIError("Quantity must be greater than 0", 400)
        
        # Get menu item
        menu_item = MenuItem.query.get(menu_item_id)
        if not menu_item:
            raise APIError("Menu item not found", 404)
        
        # Get or create cart for this restaurant
        cart = Cart.query.filter_by(user_id=user_id, restaurant_id=menu_item.restaurant_id).first()
        
        if not cart:
            # Check if user has cart from different restaurant
            existing_cart = Cart.query.filter_by(user_id=user_id).first()
            if existing_cart and existing_cart.restaurant_id != menu_item.restaurant_id:
                # Clear existing cart from different restaurant
                CartItem.query.filter_by(cart_id=existing_cart.id).delete()
                existing_cart.restaurant_id = menu_item.restaurant_id
                existing_cart.updated_at = datetime.utcnow()
                cart = existing_cart
            else:
                # Create new cart
                cart = Cart(user_id=user_id, restaurant_id=menu_item.restaurant_id)
                db.session.add(cart)
                db.session.flush()  # Get cart ID
        
        # Check if item already exists in cart
        existing_item = CartItem.query.filter_by(
            cart_id=cart.id,
            menu_item_id=menu_item_id,
            customizations=customizations
        ).first()
        
        if existing_item:
            # Update quantity
            existing_item.quantity += quantity
            existing_item.updated_at = datetime.utcnow()
        else:
            # Add new item
            cart_item = CartItem(
                cart_id=cart.id,
                menu_item_id=menu_item_id,
                quantity=quantity,
                customizations=customizations,
                price=menu_item.price
            )
            db.session.add(cart_item)
        
        cart.updated_at = datetime.utcnow()
        db.session.commit()
        
        log_info(f"Added item {menu_item_id} to cart for user {user_id}")
        return jsonify({
            'success': True,
            'message': 'Item added to cart successfully'
        })
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error adding item to cart: {str(e)}", exc_info=True)
        raise APIError("Failed to add item to cart", 500)

@cart_bp.route('/cart/count', methods=['GET'])
def get_cart_count():
    """Get total number of items in cart"""
    try:
        user_id = get_user_from_token()
        
        # Get cart item count
        cart = Cart.query.filter_by(user_id=user_id).first()
        total_items = 0
        
        if cart:
            total_items = db.session.query(db.func.sum(CartItem.quantity)).filter_by(cart_id=cart.id).scalar() or 0
        
        return jsonify({
            'success': True,
            'count': total_items
        })
        
    except APIError:
        # If not authenticated, return 0
        return jsonify({
            'success': True,
            'count': 0
        })
    except Exception as e:
        log_error(f"Error fetching cart count: {str(e)}", exc_info=True)
        return jsonify({
            'success': True,
            'count': 0
        })

