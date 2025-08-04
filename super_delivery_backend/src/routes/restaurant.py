from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.models.restaurant import Restaurant
from src.models.menu_item import MenuItem
from src.routes.error_handler import APIError, log_info, log_error
from sqlalchemy import or_

restaurant_bp = Blueprint('restaurant', __name__)

@restaurant_bp.route('/restaurants', methods=['GET'])
def get_restaurants():
    """Get all restaurants with optional filtering"""
    try:
        log_info("Fetching restaurants")
        
        cuisine_type = request.args.get('cuisine_type')
        search = request.args.get('search')
        is_active = request.args.get('is_active', 'true').lower() == 'true'
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Restaurant.query.filter_by(is_active=is_active)
        
        if cuisine_type and cuisine_type.lower() != 'all':
            query = query.filter(Restaurant.cuisine_type.ilike(f'%{cuisine_type}%'))
        
        if search:
            search_term = f'%{search}%'
            query = query.filter(or_(
                Restaurant.name.ilike(search_term),
                Restaurant.description.ilike(search_term),
                Restaurant.cuisine_type.ilike(search_term)
            ))
        
        # Apply pagination
        restaurants = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        result = {
            'restaurants': [restaurant.to_dict() for restaurant in restaurants.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': restaurants.total,
                'pages': restaurants.pages,
                'has_next': restaurants.has_next,
                'has_prev': restaurants.has_prev
            }
        }
        
        log_info(f"Retrieved {len(result['restaurants'])} restaurants")
        return jsonify(result)
        
    except Exception as e:
        log_error(f"Error fetching restaurants: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch restaurants", 500)

@restaurant_bp.route('/restaurants', methods=['POST'])
def create_restaurant():
    """Create a new restaurant"""
    try:
        data = request.json
        
        if not data:
            raise APIError("No data provided", 400)
        
        # Validate required fields
        required_fields = ['name', 'address', 'owner_id']
        for field in required_fields:
            if field not in data or not data[field]:
                raise APIError(f"Missing required field: {field}", 400)
        
        # Verify owner exists and is a restaurant owner
        owner = User.query.get(data.get('owner_id'))
        if not owner or owner.user_type.value != 'restaurant_owner':
            raise APIError('Invalid owner or user is not a restaurant owner', 400)
        
        # Check if restaurant name already exists
        existing = Restaurant.query.filter_by(name=data['name']).first()
        if existing:
            raise APIError("Restaurant with this name already exists", 409)
        
        restaurant = Restaurant(
            name=data['name'],
            description=data.get('description'),
            address=data['address'],
            phone=data.get('phone'),
            email=data.get('email'),
            cuisine_type=data.get('cuisine_type'),
            delivery_fee=data.get('delivery_fee', 0.0),
            minimum_order=data.get('minimum_order', 0.0),
            estimated_delivery_time=data.get('estimated_delivery_time', 30),
            image_url=data.get('image_url'),
            opening_hours=data.get('opening_hours'),
            owner_id=data['owner_id']
        )
        
        db.session.add(restaurant)
        db.session.commit()
        
        log_info(f"Created restaurant: {restaurant.name}")
        return jsonify({
            'success': True,
            'message': 'Restaurant created successfully',
            'restaurant': restaurant.to_dict()
        }), 201
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error creating restaurant: {str(e)}", exc_info=True)
        raise APIError("Failed to create restaurant", 500)

@restaurant_bp.route('/restaurants/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    """Get a specific restaurant by ID"""
    try:
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            raise APIError("Restaurant not found", 404)
        
        log_info(f"Retrieved restaurant: {restaurant.name}")
        return jsonify({
            'success': True,
            'restaurant': restaurant.to_dict()
        })
        
    except APIError:
        raise
    except Exception as e:
        log_error(f"Error fetching restaurant {restaurant_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch restaurant", 500)

@restaurant_bp.route('/restaurants/<int:restaurant_id>', methods=['PUT'])
def update_restaurant(restaurant_id):
    """Update a restaurant"""
    try:
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            raise APIError("Restaurant not found", 404)
        
        data = request.json
        if not data:
            raise APIError("No data provided", 400)
        
        # Update fields
        updatable_fields = [
            'name', 'description', 'address', 'phone', 'email', 'cuisine_type', 
            'delivery_fee', 'minimum_order', 'estimated_delivery_time', 'is_active',
            'image_url', 'opening_hours'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(restaurant, field, data[field])
        
        db.session.commit()
        
        log_info(f"Updated restaurant: {restaurant.name}")
        return jsonify({
            'success': True,
            'message': 'Restaurant updated successfully',
            'restaurant': restaurant.to_dict()
        })
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error updating restaurant {restaurant_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to update restaurant", 500)

@restaurant_bp.route('/restaurants/<int:restaurant_id>', methods=['DELETE'])
def delete_restaurant(restaurant_id):
    """Delete a restaurant"""
    try:
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            raise APIError("Restaurant not found", 404)
        
        restaurant_name = restaurant.name
        db.session.delete(restaurant)
        db.session.commit()
        
        log_info(f"Deleted restaurant: {restaurant_name}")
        return jsonify({
            'success': True,
            'message': 'Restaurant deleted successfully'
        })
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error deleting restaurant {restaurant_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to delete restaurant", 500)

@restaurant_bp.route('/restaurants/<int:restaurant_id>/menu', methods=['GET'])
def get_restaurant_menu(restaurant_id):
    """Get menu items for a specific restaurant"""
    try:
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            raise APIError("Restaurant not found", 404)
        
        category = request.args.get('category')
        is_available = request.args.get('is_available', 'true').lower() == 'true'
        
        query = MenuItem.query.filter_by(restaurant_id=restaurant_id, is_available=is_available)
        
        if category:
            query = query.filter(MenuItem.category.ilike(f'%{category}%'))
        
        menu_items = query.all()
        
        log_info(f"Retrieved {len(menu_items)} menu items for restaurant {restaurant_id}")
        return jsonify({
            'success': True,
            'menu_items': [item.to_dict() for item in menu_items],
            'restaurant': restaurant.to_dict()
        })
        
    except APIError:
        raise
    except Exception as e:
        log_error(f"Error fetching menu for restaurant {restaurant_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch restaurant menu", 500)

@restaurant_bp.route('/restaurants/<int:restaurant_id>/menu', methods=['POST'])
def add_menu_item(restaurant_id):
    """Add a menu item to a restaurant"""
    try:
        restaurant = Restaurant.query.get(restaurant_id)
        if not restaurant:
            raise APIError("Restaurant not found", 404)
        
        data = request.json
        if not data:
            raise APIError("No data provided", 400)
        
        # Validate required fields
        required_fields = ['name', 'price']
        for field in required_fields:
            if field not in data or data[field] is None:
                raise APIError(f"Missing required field: {field}", 400)
        
        menu_item = MenuItem(
            name=data['name'],
            description=data.get('description'),
            price=float(data['price']),
            category=data.get('category'),
            image_url=data.get('image_url'),
            is_vegetarian=data.get('is_vegetarian', False),
            is_vegan=data.get('is_vegan', False),
            is_gluten_free=data.get('is_gluten_free', False),
            calories=data.get('calories'),
            preparation_time=data.get('preparation_time', 15),
            ingredients=data.get('ingredients'),
            allergens=data.get('allergens'),
            restaurant_id=restaurant_id
        )
        
        db.session.add(menu_item)
        db.session.commit()
        
        log_info(f"Added menu item: {menu_item.name} to restaurant {restaurant_id}")
        return jsonify({
            'success': True,
            'message': 'Menu item added successfully',
            'menu_item': menu_item.to_dict()
        }), 201
        
    except APIError:
        raise
    except ValueError as e:
        raise APIError(f"Invalid price value: {str(e)}", 400)
    except Exception as e:
        db.session.rollback()
        log_error(f"Error adding menu item to restaurant {restaurant_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to add menu item", 500)

@restaurant_bp.route('/menu-items/<int:item_id>', methods=['PUT'])
def update_menu_item(item_id):
    """Update a menu item"""
    try:
        menu_item = MenuItem.query.get(item_id)
        if not menu_item:
            raise APIError("Menu item not found", 404)
        
        data = request.json
        if not data:
            raise APIError("No data provided", 400)
        
        # Update fields
        updatable_fields = [
            'name', 'description', 'price', 'category', 'image_url', 'is_available',
            'is_vegetarian', 'is_vegan', 'is_gluten_free', 'calories', 'preparation_time',
            'ingredients', 'allergens'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'price':
                    try:
                        setattr(menu_item, field, float(data[field]))
                    except ValueError:
                        raise APIError(f"Invalid price value: {data[field]}", 400)
                else:
                    setattr(menu_item, field, data[field])
        
        db.session.commit()
        
        log_info(f"Updated menu item: {menu_item.name}")
        return jsonify({
            'success': True,
            'message': 'Menu item updated successfully',
            'menu_item': menu_item.to_dict()
        })
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error updating menu item {item_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to update menu item", 500)

@restaurant_bp.route('/menu-items/<int:item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    """Delete a menu item"""
    try:
        menu_item = MenuItem.query.get(item_id)
        if not menu_item:
            raise APIError("Menu item not found", 404)
        
        item_name = menu_item.name
        db.session.delete(menu_item)
        db.session.commit()
        
        log_info(f"Deleted menu item: {item_name}")
        return jsonify({
            'success': True,
            'message': 'Menu item deleted successfully'
        })
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error deleting menu item {item_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to delete menu item", 500)

