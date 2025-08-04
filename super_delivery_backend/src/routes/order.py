from flask import Blueprint, jsonify, request
from src.models.user import User, db
from src.models.restaurant import Restaurant
from src.models.menu_item import MenuItem
from src.models.order import Order, OrderStatus
from src.models.order_item import OrderItem
from src.models.review import Review
from datetime import datetime, timedelta
import uuid

order_bp = Blueprint('order', __name__)

@order_bp.route('/orders', methods=['GET'])
def get_orders():
    """Get orders with optional filtering"""
    customer_id = request.args.get('customer_id')
    restaurant_id = request.args.get('restaurant_id')
    driver_id = request.args.get('driver_id')
    status = request.args.get('status')
    
    query = Order.query
    
    if customer_id:
        query = query.filter_by(customer_id=customer_id)
    if restaurant_id:
        query = query.filter_by(restaurant_id=restaurant_id)
    if driver_id:
        query = query.filter_by(driver_id=driver_id)
    if status:
        query = query.filter_by(status=OrderStatus(status))
    
    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify([order.to_dict() for order in orders])

@order_bp.route('/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.json
    
    # Verify customer and restaurant exist
    customer = User.query.get(data.get('customer_id'))
    restaurant = Restaurant.query.get(data.get('restaurant_id'))
    
    if not customer or customer.user_type.value != 'customer':
        return jsonify({'error': 'Invalid customer'}), 400
    if not restaurant:
        return jsonify({'error': 'Invalid restaurant'}), 400
    
    # Generate unique order number
    order_number = f"SD{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
    
    # Calculate estimated delivery time
    estimated_delivery = datetime.utcnow() + timedelta(minutes=restaurant.estimated_delivery_time)
    
    order = Order(
        order_number=order_number,
        customer_id=data['customer_id'],
        restaurant_id=data['restaurant_id'],
        delivery_address=data['delivery_address'],
        customer_phone=data.get('customer_phone'),
        special_instructions=data.get('special_instructions'),
        subtotal=data['subtotal'],
        delivery_fee=data.get('delivery_fee', restaurant.delivery_fee),
        tax_amount=data.get('tax_amount', 0.0),
        tip_amount=data.get('tip_amount', 0.0),
        discount_amount=data.get('discount_amount', 0.0),
        total_amount=data['total_amount'],
        payment_method=data.get('payment_method'),
        estimated_delivery_time=estimated_delivery
    )
    
    db.session.add(order)
    db.session.flush()  # Get the order ID
    
    # Add order items
    for item_data in data.get('items', []):
        menu_item = MenuItem.query.get(item_data['menu_item_id'])
        if not menu_item:
            return jsonify({'error': f'Invalid menu item ID: {item_data["menu_item_id"]}'}), 400
        
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=item_data['menu_item_id'],
            quantity=item_data['quantity'],
            unit_price=item_data['unit_price'],
            total_price=item_data['total_price'],
            special_instructions=item_data.get('special_instructions'),
            customizations=item_data.get('customizations')
        )
        db.session.add(order_item)
    
    db.session.commit()
    return jsonify(order.to_dict()), 201

@order_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order by ID"""
    order = Order.query.get_or_404(order_id)
    order_dict = order.to_dict()
    
    # Include order items
    order_dict['items'] = [item.to_dict() for item in order.order_items]
    
    return jsonify(order_dict)

@order_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status"""
    order = Order.query.get_or_404(order_id)
    data = request.json
    
    new_status = data.get('status')
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400
    
    try:
        order.status = OrderStatus(new_status)
        
        # Update timestamps based on status
        if new_status == 'confirmed':
            order.confirmed_at = datetime.utcnow()
        elif new_status == 'delivered':
            order.delivered_at = datetime.utcnow()
        
        # Assign driver if provided
        if 'driver_id' in data:
            driver = User.query.get(data['driver_id'])
            if driver and driver.user_type.value == 'driver':
                order.driver_id = data['driver_id']
        
        db.session.commit()
        return jsonify(order.to_dict())
    
    except ValueError:
        return jsonify({'error': 'Invalid status'}), 400

@order_bp.route('/orders/<int:order_id>/assign-driver', methods=['PUT'])
def assign_driver(order_id):
    """Assign a driver to an order"""
    order = Order.query.get_or_404(order_id)
    data = request.json
    
    driver = User.query.get(data.get('driver_id'))
    if not driver or driver.user_type.value != 'driver':
        return jsonify({'error': 'Invalid driver'}), 400
    
    order.driver_id = data['driver_id']
    if order.status == OrderStatus.READY_FOR_PICKUP:
        order.status = OrderStatus.OUT_FOR_DELIVERY
    
    db.session.commit()
    return jsonify(order.to_dict())

@order_bp.route('/orders/<int:order_id>/review', methods=['POST'])
def add_review(order_id):
    """Add a review for an order"""
    order = Order.query.get_or_404(order_id)
    data = request.json
    
    # Check if order is delivered
    if order.status != OrderStatus.DELIVERED:
        return jsonify({'error': 'Can only review delivered orders'}), 400
    
    # Check if review already exists
    existing_review = Review.query.filter_by(order_id=order_id).first()
    if existing_review:
        return jsonify({'error': 'Order already reviewed'}), 400
    
    review = Review(
        rating=data['rating'],
        comment=data.get('comment'),
        food_rating=data.get('food_rating'),
        delivery_rating=data.get('delivery_rating'),
        customer_id=order.customer_id,
        restaurant_id=order.restaurant_id,
        order_id=order_id,
        driver_id=order.driver_id
    )
    
    db.session.add(review)
    
    # Update restaurant rating (simple average)
    restaurant = order.restaurant
    reviews = Review.query.filter_by(restaurant_id=restaurant.id).all()
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        restaurant.rating = round(avg_rating, 1)
    
    db.session.commit()
    return jsonify(review.to_dict()), 201

@order_bp.route('/orders/available', methods=['GET'])
def get_available_orders():
    """Get orders available for pickup by drivers"""
    orders = Order.query.filter_by(
        status=OrderStatus.READY_FOR_PICKUP,
        driver_id=None
    ).order_by(Order.created_at.asc()).all()
    
    return jsonify([order.to_dict() for order in orders])

