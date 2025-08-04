from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.models.restaurant import Restaurant
from src.models.menu_item import MenuItem
from sqlalchemy import or_

restaurant_bp = Blueprint('restaurant', __name__)

@restaurant_bp.route('/restaurants', methods=['GET'])
def get_restaurants():
    """Get all restaurants with optional filtering"""
    cuisine_type = request.args.get('cuisine_type')
    search = request.args.get('search')
    is_active = request.args.get('is_active', 'true').lower() == 'true'
    
    query = Restaurant.query.filter_by(is_active=is_active)
    
    if cuisine_type:
        query = query.filter_by(cuisine_type=cuisine_type)
    
    if search:
        query = query.filter(or_(
            Restaurant.name.contains(search),
            Restaurant.description.contains(search)
        ))
    
    restaurants = query.all()
    return jsonify([restaurant.to_dict() for restaurant in restaurants])

@restaurant_bp.route('/restaurants', methods=['POST'])
def create_restaurant():
    """Create a new restaurant"""
    data = request.json
    
    # Verify owner exists and is a restaurant owner
    owner = User.query.get(data.get('owner_id'))
    if not owner or owner.user_type.value != 'restaurant_owner':
        return jsonify({'error': 'Invalid owner'}), 400
    
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
    return jsonify(restaurant.to_dict()), 201

@restaurant_bp.route('/restaurants/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    """Get a specific restaurant by ID"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    return jsonify(restaurant.to_dict())

@restaurant_bp.route('/restaurants/<int:restaurant_id>', methods=['PUT'])
def update_restaurant(restaurant_id):
    """Update a restaurant"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    data = request.json
    
    # Update fields
    for field in ['name', 'description', 'address', 'phone', 'email', 'cuisine_type', 
                  'delivery_fee', 'minimum_order', 'estimated_delivery_time', 'is_active',
                  'image_url', 'opening_hours']:
        if field in data:
            setattr(restaurant, field, data[field])
    
    db.session.commit()
    return jsonify(restaurant.to_dict())

@restaurant_bp.route('/restaurants/<int:restaurant_id>', methods=['DELETE'])
def delete_restaurant(restaurant_id):
    """Delete a restaurant"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    db.session.delete(restaurant)
    db.session.commit()
    return '', 204

@restaurant_bp.route('/restaurants/<int:restaurant_id>/menu', methods=['GET'])
def get_restaurant_menu(restaurant_id):
    """Get menu items for a specific restaurant"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    category = request.args.get('category')
    is_available = request.args.get('is_available', 'true').lower() == 'true'
    
    query = MenuItem.query.filter_by(restaurant_id=restaurant_id, is_available=is_available)
    
    if category:
        query = query.filter_by(category=category)
    
    menu_items = query.all()
    return jsonify([item.to_dict() for item in menu_items])

@restaurant_bp.route('/restaurants/<int:restaurant_id>/menu', methods=['POST'])
def add_menu_item(restaurant_id):
    """Add a menu item to a restaurant"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    data = request.json
    
    menu_item = MenuItem(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
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
    return jsonify(menu_item.to_dict()), 201

@restaurant_bp.route('/menu-items/<int:item_id>', methods=['PUT'])
def update_menu_item(item_id):
    """Update a menu item"""
    menu_item = MenuItem.query.get_or_404(item_id)
    data = request.json
    
    # Update fields
    for field in ['name', 'description', 'price', 'category', 'image_url', 'is_available',
                  'is_vegetarian', 'is_vegan', 'is_gluten_free', 'calories', 'preparation_time',
                  'ingredients', 'allergens']:
        if field in data:
            setattr(menu_item, field, data[field])
    
    db.session.commit()
    return jsonify(menu_item.to_dict())

@restaurant_bp.route('/menu-items/<int:item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    """Delete a menu item"""
    menu_item = MenuItem.query.get_or_404(item_id)
    db.session.delete(menu_item)
    db.session.commit()
    return '', 204

